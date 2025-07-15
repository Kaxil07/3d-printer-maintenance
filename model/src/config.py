class Config:
    DEBUG = False
    TESTING = False
    SECRET_KEY = 'your-secret-key'  # Change this to a secure key in production
    CORS_ORIGINS = ['https://your-frontend-domain']
    MODEL_PATH = 'models/printer_model.pkl'

class ProductionConfig(Config):
    SERVER_NAME = 'your-api-domain'
    SSL_CONTEXT = 'adhoc'  # For HTTPS
