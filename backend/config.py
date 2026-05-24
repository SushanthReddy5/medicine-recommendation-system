import os

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "ml_model")
DATA_PATH = os.path.join(BASE_DIR, "dataset.csv")

class Config:
    DEBUG    = False
    PORT     = int(os.environ.get("PORT", 5001))
    HOST     = "0.0.0.0"

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    "development": DevelopmentConfig,
    "production" : ProductionConfig,
    "default"    : DevelopmentConfig,
}
