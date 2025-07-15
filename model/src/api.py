from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import joblib
import numpy as pd
import numpy as np
import logging
import traceback
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from maintenance_rules import generate_alerts, calculate_wear_factor, analyze_thermal_stress, MATERIAL_PROPERTIES

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
CORS(app, resources={r"/*": {"origins": "*"}})

def validate_prediction_data(data):
    """Validate the prediction request data."""
    if not isinstance(data, dict):
        return False, "Invalid request format"

    required_fields = [
        'material', 'nozzle_temperature', 'bed_temperature', 'print_speed',
        'fan_speed', 'layer_height', 'wall_thickness', 'nozzle_diameter',
        'infill_density', 'infill_pattern', 'print_time'
    ]

    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"

    if data['material'] not in MATERIAL_PROPERTIES:
        return False, f"Invalid material type: {data['material']}"

    return True, None

@app.route('/predict', methods=['POST'])
def predict():
    """Handle 3D printer maintenance prediction requests."""
    try:
        logger.info("=== New Prediction Request ===")
        logger.debug("Headers: %s", dict(request.headers))
        logger.debug("Path: %s", request.path)
        
        # Get and validate JSON data
        try:
            data = request.get_json()
        except Exception as e:
            logger.error("Failed to parse JSON: %s", str(e))
            return jsonify({
                'status': 'error',
                'error': 'Invalid JSON format',
                'wear_factor': 0.0,
                'thermal_stress': 0.0,
                'alerts': ['Error: Could not parse request data']
            }), 400
        
        # Validate request data
        is_valid, error_message = validate_prediction_data(data)
        if not is_valid:
            logger.error("Validation error: %s", error_message)
            return jsonify({
                'status': 'error',
                'error': error_message,
                'wear_factor': 0.0,
                'thermal_stress': 0.0,
                'alerts': [f'Error: {error_message}']
            }), 400

        try:
            # Calculate wear factor
            logger.debug("Calculating wear factor...")
            wear_factor = calculate_wear_factor(data)
            if isinstance(wear_factor, (np.floating, np.integer)):
                wear_factor = float(wear_factor)
            logger.debug("Wear factor calculated: %s", wear_factor)
            
            # Calculate thermal stress
            logger.debug("Analyzing thermal stress...")
            thermal_stress = analyze_thermal_stress(data, MATERIAL_PROPERTIES[data['material']])
            if isinstance(thermal_stress, (np.floating, np.integer)):
                thermal_stress = float(thermal_stress)
            logger.debug("Thermal stress calculated: %s", thermal_stress)
            
            # Generate alerts
            logger.debug("Generating maintenance alerts...")
            try:
                alerts = generate_alerts(data)
                if not isinstance(alerts, list):
                    logger.warning("generate_alerts returned non-list value: %s", alerts)
                    alerts = []
            except Exception as e:
                logger.error("Error generating alerts: %s", str(e))
                alerts = []
            
            # Prepare successful response
            response = {
                'status': 'success',
                'wear_factor': wear_factor if wear_factor is not None else 0.0,
                'thermal_stress': thermal_stress if thermal_stress is not None else 0.0,
                'alerts': alerts
            }
            
            logger.info("Prediction successful: %s", response)
            return jsonify(response)
            
        except Exception as e:
            logger.error("Error processing prediction: %s", str(e))
            logger.error("Full traceback: %s", traceback.format_exc())
            return jsonify({
                'status': 'error',
                'error': 'Failed to process prediction',
                'details': str(e),
                'wear_factor': 0.0,
                'thermal_stress': 0.0,
                'alerts': ['Error: Failed to process prediction']
            }), 500
    
    except Exception as e:
        logger.error("Unhandled error in prediction endpoint: %s", str(e))
        logger.error("Full traceback: %s", traceback.format_exc())
        return jsonify({
            'status': 'error',
            'error': 'Internal server error',
            'details': str(e),
            'wear_factor': 0.0,
            'thermal_stress': 0.0,
            'alerts': ['Error: Unexpected server error']
        }), 500

@app.route('/test', methods=['GET'])
def test():
    """Test endpoint to verify API is working."""
    try:
        response = {
            'status': 'ok',
            'message': 'API is working',
            'supported_materials': list(MATERIAL_PROPERTIES.keys())
        }
        return jsonify(response)
    except Exception as e:
        logger.error("Error in test endpoint: %s", str(e))
        return jsonify({
            'status': 'error',
            'error': 'API test failed',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    try:
        port = 5001
        host = '127.0.0.1'
        logger.info(f"Starting Flask server on {host}:{port}...")
        app.run(
            host=host,
            port=port,
            debug=True,
            use_reloader=False
        )
    except Exception as e:
        logger.error("Failed to start server: %s", str(e))
        logger.error("Full traceback: %s", traceback.format_exc())
