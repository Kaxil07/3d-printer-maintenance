# 3D Printer Maintenance Application - Deployment Guide

## Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- SSL certificate for production
- Production server with HTTPS support

## Frontend Deployment

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.production` to your deployment environment
- Update `VITE_API_URL` with your actual production API URL

3. Build for production:
```bash
npm run build:prod
```

4. Deploy the `dist` folder to your web server
- Upload the contents of the `dist` directory to your hosting service
- Configure your web server to serve the static files
- Ensure all routes redirect to index.html for client-side routing

## Backend Deployment

1. Set up Python environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

2. Configure production settings:
- Update `config.py` with your production settings
- Set secure `SECRET_KEY`
- Configure `CORS_ORIGINS` with your frontend domain
- Update SSL certificate paths in `wsgi.py`

3. Set environment variables:
```bash
export FLASK_ENV=production
export FLASK_APP=wsgi.py
# On Windows:
# set FLASK_ENV=production
# set FLASK_APP=wsgi.py
```

4. Start the production server:
```bash
python wsgi.py
```

## Environment Variables

### Frontend (.env.production)
- `VITE_API_URL`: Backend API URL (e.g., https://api.your-domain.com)
- `VITE_APP_VERSION`: Application version

### Backend
- `FLASK_ENV`: Set to 'production'
- `FLASK_APP`: Set to 'wsgi.py'
- `SECRET_KEY`: Flask secret key (must be secure in production)

## Security Considerations

1. SSL/TLS Configuration
- Ensure valid SSL certificates are installed
- Configure secure SSL protocols and ciphers
- Enable HTTP to HTTPS redirection

2. API Security
- Rate limiting is configured per IP address
- CORS is restricted to the frontend domain
- All endpoints validate input data

3. Error Handling
- Production error messages don't expose sensitive information
- All errors are properly logged
- Client-side error boundary catches React errors

## Monitoring and Maintenance

1. Logging
- Backend logs are configured in `api.py`
- Use appropriate logging service in production
- Monitor API rate limiting and errors

2. Backups
- Regularly backup ML models
- Keep configuration files versioned
- Document all environment-specific settings

3. Updates
- Keep dependencies updated
- Monitor security advisories
- Test updates in staging environment first

## Troubleshooting

1. Common Issues
- Check SSL certificate configuration
- Verify environment variables are set correctly
- Ensure CORS settings match your domains

2. Performance
- Monitor API response times
- Check rate limiting settings
- Optimize static asset caching

3. Support
- Document known issues and solutions
- Maintain deployment checklist
- Keep contact information updated

## Deployment Checklist

Before deploying:
- [ ] Run all tests: `npm test`
- [ ] Check test coverage: `npm run test:coverage`
- [ ] Build production assets: `npm run build:prod`
- [ ] Verify all environment variables
- [ ] Check SSL certificates
- [ ] Test API rate limiting
- [ ] Verify CORS settings
- [ ] Backup existing data/models
- [ ] Update documentation

After deploying:
- [ ] Verify HTTPS is working
- [ ] Test all main features
- [ ] Check error logging
- [ ] Monitor API performance
- [ ] Verify database connections
- [ ] Test backup procedures
