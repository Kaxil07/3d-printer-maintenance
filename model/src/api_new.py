from flask import Flask, request, jsonify
from flask_cors import CORS
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
CORS(app)

# Initialize model variable
model = None

# Load the trained model
try:
    model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'printer_model.pkl')
    logger.info(f"Looking for model at: {model_path}")
    
    if not os.path.exists(model_path):
        logger.warning(f"Model file not found at {model_path}, predictions will use fallback logic")
    else:
        model = joblib.load(model_path)
        logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    logger.error(traceback.format_exc())

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        logger.info("=== New Prediction Request ===")
        
        # Get JSON data
        try:
            data = request.get_json()
            logger.debug("Request data: %s", data)
        except Exception as e:
            logger.error("Failed to parse JSON: %s", str(e))
            return jsonify({
                'error': 'Invalid JSON data',
                'wear_factor': 0.0,
                'thermal_stress': 0.0,
                'alerts': ['Error: Invalid request format']
            }), 400
        
        if not data:
            logger.error("No data received")
            return jsonify({
                'error': 'No data received',
                'wear_factor': 0.0,
                'thermal_stress': 0.0,
                'alerts': ['Error: No data provided']
            }), 400
        
        # Validate required fields
        required_fields = [
            'material', 'nozzle_temperature', 'bed_temperature', 'print_speed',
            'fan_speed', 'layer_height', 'wall_thickness', 'nozzle_diameter',
            'infill_density', 'infill_pattern', 'print_time'
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            logger.error("Missing required fields: %s", missing_fields)
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}',
                'wear_factor': 0.0,
                'thermal_stress': 0.0,
                'alerts': [f'Error: Missing {len(missing_fields)} required fields']
            }), 400
        
        # Validate material type
        if data['material'] not in MATERIAL_PROPERTIES:
            logger.error("Invalid material type: %s", data['material'])
            return jsonify({
                'error': f'Invalid material type: {data["material"]}',
                'wear_factor': 0.0,
                'thermal_stress': 0.0,
                'alerts': ['Error: Unsupported material type']
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
            alerts = generate_alerts(data)
            if not isinstance(alerts, list):
                alerts = []
            logger.debug("Alerts generated: %s", alerts)
            
            # Ensure all values are JSON serializable
            response = {
                'wear_factor': wear_factor if wear_factor is not None else 0.0,
                'thermal_stress': thermal_stress if thermal_stress is not None else 0.0,
                'alerts': alerts if alerts else []
            }
            
            logger.info("Sending prediction response: %s", response)
            return jsonify(response)
            
        except Exception as e:
            logger.error("Error processing prediction: %s", str(e))
            logger.error("Full traceback: %s", traceback.format_exc())
            return jsonify({
                'error': 'Error processing prediction',
                'details': str(e),
                'wear_factor': 0.0,
                'thermal_stress': 0.0,
                'alerts': ['Error: Failed to process prediction']
            }), 500
    
    except Exception as e:
        error_msg = f"Error in prediction: {str(e)}"
        logger.error(error_msg)
        logger.error("Full traceback: %s", traceback.format_exc())
        return jsonify({
            'error': error_msg,
            'wear_factor': 0.0,
            'thermal_stress': 0.0,
            'alerts': ['Error: Failed to process prediction']
        }), 500

@app.route('/test', methods=['GET'])
def test():
    """Test endpoint to verify API is working"""
    return jsonify({
        'status': 'ok',
        'message': 'API is working',
        'supported_materials': list(MATERIAL_PROPERTIES.keys())
    })

if __name__ == '__main__':
    try:
        port = 5001
        logger.info(f"Starting Flask server on port {port}...")
        app.run(debug=True, port=port, host='127.0.0.1', use_reloader=False)
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        logger.error(traceback.format_exc())
