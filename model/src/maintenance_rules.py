import math
import random

MATERIAL_PROPERTIES = {
    'PLA': {
        'temp_range': [180, 220],
        'bed_temp_range': [50, 70],
        'max_speed': 120,
        'fan_speed_range': [70, 100],
        'typical_layer_height': [0.1, 0.3],
        'moisture_sensitive': False,
        'abrasive': False,
        'optimal_wall_thickness': [0.4, 1.2]
    },
    'ABS': {
        'temp_range': [220, 250],
        'bed_temp_range': [95, 110],
        'max_speed': 100,
        'fan_speed_range': [0, 30],
        'typical_layer_height': [0.1, 0.3],
        'moisture_sensitive': True,
        'abrasive': False,
        'optimal_wall_thickness': [0.4, 1.6]
    },
    'PETG': {
        'temp_range': [230, 250],
        'bed_temp_range': [75, 90],
        'max_speed': 90,
        'fan_speed_range': [30, 50],
        'typical_layer_height': [0.1, 0.3],
        'moisture_sensitive': True,
        'abrasive': False,
        'optimal_wall_thickness': [0.4, 1.4]
    },
    'TPU': {
        'temp_range': [220, 235],
        'bed_temp_range': [30, 45],
        'max_speed': 40,
        'fan_speed_range': [50, 70],
        'typical_layer_height': [0.1, 0.25],
        'moisture_sensitive': True,
        'abrasive': False,
        'optimal_wall_thickness': [0.8, 2.0]
    }
}

maintenance_guides = {
    'nozzle': {
        'cleaning': [
            "Clean nozzle with brass brush",
            "Perform cold pull with cleaning filament",
            "Check nozzle diameter for wear",
            "Inspect nozzle tip for damage or clogs"
        ],
        'replacement': [
            "Replace nozzle if worn or damaged",
            "Check nozzle alignment after replacement",
            "Calibrate Z-offset after nozzle change"
        ]
    },
    'extruder': {
        'maintenance': [
            "Check extruder gear for wear",
            "Clean extruder drive gear",
            "Verify extruder tension",
            "Check for filament dust accumulation"
        ],
        'calibration': [
            "Calibrate E-steps",
            "Test extruder motor temperature",
            "Check for extruder skipping"
        ]
    },
    'bed': {
        'leveling': [
            "Perform bed leveling",
            "Check bed surface adhesion",
            "Clean bed surface thoroughly",
            "Verify bed temperature consistency"
        ],
        'maintenance': [
            "Inspect bed surface for damage",
            "Check bed heating elements",
            "Verify bed thermal sensor"
        ]
    },
    'mechanical': {
        'belts': [
            "Check belt tension",
            "Inspect belts for wear or damage",
            "Verify pulley alignment",
            "Listen for unusual belt sounds"
        ],
        'rails': [
            "Lubricate linear rails",
            "Check for smooth movement",
            "Inspect bearings for wear",
            "Clean rail surfaces"
        ]
    }
}

def calculate_wear_factor(params):
    """Calculate a wear factor based on printing parameters."""
    material_props = MATERIAL_PROPERTIES[params['material']]
    wear_factor = 0.0
    
    # Base wear from speed
    speed_stress = params['print_speed'] / material_props['max_speed']
    wear_factor += min(1.0, speed_stress * 1.2)  # Allow some over-speed with penalty
    
    # Temperature stress
    temp_min, temp_max = material_props['temp_range']
    temp_optimal = (temp_min + temp_max) / 2
    temp_stress = abs(params['nozzle_temperature'] - temp_optimal) / (temp_max - temp_min)
    wear_factor += temp_stress * 0.8
    
    # Layer height impact
    min_layer, max_layer = material_props['typical_layer_height']
    if params['layer_height'] < min_layer:
        wear_factor += 0.3  # Significant wear for very thin layers
    elif params['layer_height'] > max_layer:
        wear_factor += 0.2  # Moderate wear for thick layers
    
    # Wall thickness stress
    min_wall, max_wall = material_props['optimal_wall_thickness']
    if params['wall_thickness'] < min_wall:
        wear_factor += 0.25
    elif params['wall_thickness'] > max_wall:
        wear_factor += 0.15
    
    # Material-specific adjustments
    if material_props['abrasive']:
        wear_factor *= 1.3
    
    return min(1.0, wear_factor)

def analyze_thermal_stress(params, material_props):
    """Analyze thermal stress based on temperature settings."""
    stress_level = 0.0
    
    # Temperature deviation from optimal range
    temp_min, temp_max = material_props['temp_range']
    bed_min, bed_max = material_props['bed_temp_range']
    
    # Nozzle temperature stress
    temp_optimal = (temp_min + temp_max) / 2
    temp_stress = abs(params['nozzle_temperature'] - temp_optimal) / (temp_max - temp_min)
    stress_level += temp_stress * 0.6
    
    # Bed temperature stress
    bed_optimal = (bed_min + bed_max) / 2
    bed_stress = abs(params['bed_temperature'] - bed_optimal) / (bed_max - bed_min)
    stress_level += bed_stress * 0.4
    
    # Fan speed impact
    fan_min, fan_max = material_props['fan_speed_range']
    if params['fan_speed'] < fan_min:
        stress_level += 0.3  # Poor cooling can cause thermal issues
    elif params['fan_speed'] > fan_max:
        stress_level += 0.2  # Excessive cooling can cause layer adhesion problems
    
    # Additional infill-related stress calculation
    infill_stress = 0.0
    
    # Infill density impact
    if params['infill_density'] < 15:
        infill_stress += 0.3  # Very low infill can cause structural issues
    elif params['infill_density'] > 80:
        infill_stress += 0.2  # Very high infill increases wear
    
    # Pattern-specific considerations
    if params['infill_pattern'] == 'gyroid':
        if params['print_speed'] > 0.8 * material_props['max_speed']:
            infill_stress += 0.25  # Gyroid patterns are complex and need slower speeds
    elif params['infill_pattern'] == 'honeycomb':
        if params['print_speed'] > 0.9 * material_props['max_speed']:
            infill_stress += 0.2  # Honeycomb patterns need moderate speed control
    
    return min(1.0, stress_level + infill_stress * 0.4)  # Weight infill stress at 40%

def get_material_specific_recommendations(params, wear_factor, thermal_stress):
    """Get material-specific maintenance recommendations."""
    material_props = MATERIAL_PROPERTIES[params['material']]
    recommendations = []
    
    # Temperature-related recommendations
    temp_min, temp_max = material_props['temp_range']
    if params['nozzle_temperature'] > temp_max:
        recommendations.append(f"Reduce nozzle temperature to within {temp_min}°C - {temp_max}°C for {params['material']}")
    elif params['nozzle_temperature'] < temp_min:
        recommendations.append(f"Increase nozzle temperature to within {temp_min}°C - {temp_max}°C for {params['material']}")
    
    # Speed recommendations
    if params['print_speed'] > material_props['max_speed']:
        recommendations.append(f"Reduce print speed below {material_props['max_speed']}mm/s for {params['material']}")
    
    # Layer height recommendations
    min_layer, max_layer = material_props['typical_layer_height']
    if params['layer_height'] > max_layer:
        recommendations.append(f"Reduce layer height to {max_layer}mm or below for better quality with {params['material']}")
    
    # Wall thickness recommendations
    min_wall, max_wall = material_props['optimal_wall_thickness']
    if params['wall_thickness'] < min_wall:
        recommendations.append(f"Increase wall thickness to at least {min_wall}mm for structural integrity")
    
    return recommendations

def generate_alerts(params):
    """Generate comprehensive maintenance alerts and recommendations."""
    material_props = MATERIAL_PROPERTIES[params['material']]
    wear_factor = calculate_wear_factor(params)
    thermal_stress = analyze_thermal_stress(params, material_props)
    
    alerts = []
    
    # Material-specific recommendations
    material_recs = get_material_specific_recommendations(params, wear_factor, thermal_stress)
    for rec in material_recs:
        alerts.append({
            'type': 'warning',
            'message': rec,
            'component': 'Material Settings',
            'priority': 'high'
        })
    
    # High wear alerts
    if wear_factor > 0.7:
        alerts.append({
            'type': 'critical',
            'message': 'High wear conditions detected',
            'component': 'Nozzle',
            'priority': 'critical',
            'maintenance_items': maintenance_guides['nozzle']['cleaning']
        })
    
    # Thermal stress alerts
    if thermal_stress > 0.8:
        alerts.append({
            'type': 'critical',
            'message': 'High thermal stress detected',
            'component': 'Temperature Control',
            'priority': 'critical',
            'maintenance_items': [
                "Check cooling system efficiency",
                "Verify temperature sensor calibration",
                "Inspect heat break condition"
            ]
        })
    
    # Layer adhesion risk
    if params['layer_height'] > 0.8 * params['nozzle_diameter']:
        alerts.append({
            'type': 'warning',
            'message': 'Layer height too close to nozzle diameter',
            'component': 'Print Settings',
            'priority': 'high'
        })
    
    return alerts
