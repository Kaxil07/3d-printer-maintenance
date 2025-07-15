from api import app
from config import ProductionConfig
import ssl

app.config.from_object(ProductionConfig)

if __name__ == '__main__':
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    # Update these paths with your SSL certificate paths
    context.load_cert_chain('path/to/cert.pem', 'path/to/key.pem')
    app.run(ssl_context=context)
