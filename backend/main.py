from fastapi import FastAPI, Depends, status, HTTPException, Request
from sqlalchemy.orm import Session
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from models import RegisterUser, UserResponse
from db import get_db, Users
from passlib.context import CryptContext
import jwt
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone
from authlib.integrations.starlette_client import OAuth
import os
from dotenv import load_dotenv
from urllib.parse import urlencode

load_dotenv()


ALGORTM = 'HS256'
SECRET_KEY = '09d25e094faa6ca2556c818166b7a9563b93f7099f6f8f4caa6cf63b88e8d3e7'
ACCESS_EXPIRES = 30
GITHIB_CLIENT_ID = os.getenv('GITHIB_CLIENT_ID')
GITHIB_CLIENT_SECRET = os.getenv('GITHIB_CLIENT_SECRET')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')


app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/token')

origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
]

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        
    allow_credentials=True,
    allow_methods=["*"],          
    allow_headers=["*"],
)

oauth = OAuth()

oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

oauth.register(
    name='github',
    client_id=GITHIB_CLIENT_ID,
    client_secret=GITHIB_CLIENT_SECRET,
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'}
)

pwd_context = CryptContext(schemes=['argon2'], deprecated='auto')

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password, hashed_password):
    return pwd_context.verify(password, hashed_password)


@app.post('/register', response_model=UserResponse)
async def register(user: RegisterUser, db: Session = Depends(get_db)):
    user_db = db.query(Users).filter(Users.username == user.username).first()

    if user_db:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='User already register')
    
    if not user_db:
        user_db=Users(username=user.username, email=user.email, password=hash_password(user.password), provider='local', provider_id=user.username)
        db.add(user_db)
        db.commit()
        db.refresh(user_db)

    return user_db

@app.post('/token')
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.username == form_data.username).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User is not found')
    
    if not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='username or password is not correct')
    
    if user is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='User is none')
    
    payload = {
        'sub': user.username,
        'exp': datetime.now(timezone.utc) + timedelta(minutes=ACCESS_EXPIRES)
    }

    access_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORTM)


    return {'access_token': access_token, 'type': 'bearer'}


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    creditials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},)

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORTM])
        username = payload.get('sub')

        if username is None:
            raise creditials_exception
        
    except InvalidTokenError:
        raise creditials_exception
    
    user = db.query(Users).filter(Users.username == username).first()

    if user is None:
        raise creditials_exception
    
    return user

@app.get('/user', response_model=UserResponse)
async def read_user(user: Users = Depends(get_current_user)):
    return user

@app.get('/auth/google')
async def google_login(request: Request):
    redirect_uri = 'http://127.0.0.1:8000/auth/google/callback'
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get('/auth/github')
async def github_login(request: Request):
    redirect_uri = 'http://127.0.0.1:8000/auth/github/callback'
    return await oauth.github.authorize_redirect(request, redirect_uri)

@app.get('/auth/google/callback')
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token['userinfo']

    email = user_info['email']
    username = user_info['email'].split('@')[0]

    provider = 'google'
    provider_id = user_info['sub']

    user = db.query(Users).filter(Users.provider == provider, Users.provider_id == provider_id).first()

    if not user:
        user = Users(username=username, email=email, password=None, provider=provider, provider_id=provider_id)
        db.add(user)
        db.commit()
        db.refresh(user)

    payload = {
        'sub': user.username,
        'exp': datetime.now(timezone.utc) + timedelta(ACCESS_EXPIRES)
    }

    access_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORTM)

    params = urlencode({'token': access_token})

    redirect_url = f'http://localhost:5173/?{params}'

    return RedirectResponse(url=redirect_url)


@app.get('/auth/github/callback')
async def github_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.github.authorize_access_token(request)
    resp = await oauth.github.get('user', token=token)
    profile = resp.json()

    email_resp = await oauth.github.get('user/emails', token=token)
    emails = email_resp.json()
    email = next((e['email'] for e in emails if e['primary'] and e.get('verified', True)), None)

    username = profile['login']
    provider = 'github'
    provider_id = str(profile['id'])

    user = db.query(Users).filter(Users.provider == provider, Users.provider_id == provider_id).first()

    if not user:
        user = Users(username=username, email=email, password=None, provider=provider, provider_id=provider_id)
        db.add(user)
        db.commit()
        db.refresh(user)

    payload = {
        'sub': user.username,
        'exp': datetime.now(timezone.utc) + timedelta(ACCESS_EXPIRES)
    }

    access_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORTM)

    params = urlencode({'token': access_token})

    redirect_url = f'http://localhost:5173/?{params}'

    return RedirectResponse(url=redirect_url)