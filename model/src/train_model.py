import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib
from maintenance_rules import MATERIAL_PROPERTIES, calculate_wear_factor, analyze_thermal_stress
import random
from scipy.stats import norm
import os

def ensure_model_directory():
    """Ensure the models directory exists."""
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    return model_dir
        os.makedirs('models')

def calculate_material_stress(params, material_props):
    """Calculate material-specific stress factors."""
    stress = 0.0
    
    # Temperature stress
    temp_min, temp_max = material_props['temp_range']
    optimal_temp = (temp_min + temp_max) / 2
    temp_stress = abs(params['nozzle_temperature'] - optimal_temp) / (temp_max - temp_min)
    stress += temp_stress * 0.4
    
    # Speed stress
    speed_stress = params['print_speed'] / material_props['max_speed']
    stress += min(1.0, speed_stress) * 0.3
    
    # Layer adhesion stress
    layer_stress = params['layer_height'] / 0.4  # Normalized to typical max layer height
    stress += layer_stress * 0.3
    
    return min(1.0, stress)

def generate_synthetic_data(n_samples=20000):
    """Generate synthetic training data with realistic patterns and correlations."""
    data = []
    
    for _ in range(n_samples):
        # Select material with realistic distribution
        material_weights = {
            'PLA': 0.5,    # Most common
            'PETG': 0.25,  # Second most common
            'ABS': 0.15,   # Less common
            'TPU': 0.1     # Least common
        }
        material = random.choices(list(material_weights.keys()), 
                                weights=material_weights.values())[0]
        material_props = MATERIAL_PROPERTIES[material]
        
        # Generate base parameters
        temp_min, temp_max = material_props['temp_range']
        bed_min, bed_max = material_props['bed_temp_range']
        fan_min, fan_max = material_props['fan_speed_range']
        
        # Generate correlated parameters
        base_quality = random.random()  # Base quality factor
        
        # Layer height correlates with quality expectations
        layer_height = np.clip(
            norm.rvs(loc=0.2 + (0.15 * (1-base_quality)), scale=0.05),
            0.1, 0.4
        )
        
        # Wall thickness correlates with layer height
        wall_thickness = np.clip(
            norm.rvs(loc=0.8 + layer_height, scale=0.2),
            0.4, 2.0
        )
        
        # Generate parameters with realistic correlations
        params = {
            'material': material,
            'layer_height': layer_height,
            'wall_thickness': wall_thickness,
            'infill_density': np.clip(
                norm.rvs(loc=20 + (40 * base_quality), scale=10),
                0, 100
            ),
            'infill_pattern': random.choices(
                ['grid', 'triangles', 'honeycomb', 'lines'],
                weights=[0.4, 0.3, 0.2, 0.1]
            )[0],
            'nozzle_temperature': np.clip(
                norm.rvs(loc=(temp_min + temp_max) / 2, scale=(temp_max - temp_min) / 6),
                temp_min, temp_max
            ),
            'bed_temperature': np.clip(
                norm.rvs(loc=(bed_min + bed_max) / 2, scale=(bed_max - bed_min) / 6),
                bed_min, bed_max
            ),
            'print_speed': np.clip(
                norm.rvs(loc=material_props['max_speed'] * 0.7, scale=material_props['max_speed'] * 0.2),
                10, material_props['max_speed'] * 1.2
            ),
            'fan_speed': np.clip(
                norm.rvs(loc=(fan_min + fan_max) / 2, scale=(fan_max - fan_min) / 4),
                0, 100
            )
        }
        
        # Calculate stress factors
        wear_factor = calculate_wear_factor(params)
        thermal_stress = analyze_thermal_stress(params, material_props)
        material_stress = calculate_material_stress(params, material_props)
        
        # Calculate maintenance probability
        base_probability = 0.0
        
        # Material properties impact
        if material_props.get('abrasive'):
            base_probability += 0.15
        if material_props.get('moisture_sensitive'):
            base_probability += 0.08
        
        # Temperature impact
        temp_impact = abs(params['nozzle_temperature'] - ((temp_min + temp_max) / 2)) / (temp_max - temp_min)
        base_probability += temp_impact * 0.2
        
        # Speed impact
        speed_impact = (params['print_speed'] / material_props['max_speed']) - 0.7
        if speed_impact > 0:
            base_probability += speed_impact * 0.25
        
        # Layer height impact
        if params['layer_height'] < 0.1:
            base_probability += 0.15
        elif params['layer_height'] > 0.35:
            base_probability += 0.1
        
        # Combined stress factors
        stress_probability = (
            wear_factor * 0.3 +
            thermal_stress * 0.2 +
            material_stress * 0.25
        )
        
        # Final probability with some randomness
        maintenance_probability = min(1.0, base_probability + stress_probability)
        maintenance_needed = random.random() < maintenance_probability
        
        # Calculate health score
        health_score = max(0, min(100, 100 * (1 - maintenance_probability) + 
                                random.normalvariate(0, 3)))
        
        data.append({
            **params,
            'maintenance_needed': maintenance_needed,
            'health_score': health_score
        })
    
    return pd.DataFrame(data)

def create_preprocessing_pipeline(X):
    """Create a pipeline with feature engineering."""
    numeric_features = ['layer_height', 'wall_thickness', 'infill_density', 
                       'nozzle_temperature', 'bed_temperature', 'print_speed', 'fan_speed']
    categorical_features = ['material', 'infill_pattern']
    
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(drop='first', sparse_output=False))
    ])
    
    return ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])

def train_model():
    """Train the maintenance prediction model with advanced features and tuning."""
    try:
        print("Ensuring model directory exists...")
        ensure_model_directory()
        
        print("Generating synthetic training data...")
        df = generate_synthetic_data()
        
        # Split features and target
        X = df.drop(['maintenance_needed', 'health_score'], axis=1)
        y = df['maintenance_needed']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        print("Creating preprocessing pipeline...")
        preprocessor = create_preprocessing_pipeline(X)
        
        # Create model pipeline
        model = Pipeline([
            ('preprocessor', preprocessor),
            ('classifier', GradientBoostingClassifier(
                n_estimators=300,
                learning_rate=0.05,
                max_depth=6,
                min_samples_split=50,
                min_samples_leaf=20,
                random_state=42
            ))
        ])
        
        # Define parameter grid
        param_grid = {
            'classifier__n_estimators': [200, 300],
            'classifier__learning_rate': [0.05, 0.1],
            'classifier__max_depth': [5, 6],
            'classifier__min_samples_split': [40, 50],
            'classifier__min_samples_leaf': [15, 20]
        }
        
        print("Performing grid search for optimal parameters...")
        grid_search = GridSearchCV(
            model, param_grid, cv=5, n_jobs=-1,
            scoring='f1', verbose=1
        )
        
        print("Training model...")
        grid_search.fit(X_train, y_train)
        
        best_model = grid_search.best_estimator_
        
        # Evaluate model
        print("\nBest parameters:", grid_search.best_params_)
        print("\nModel Evaluation:")
        y_pred = best_model.predict(X_test)
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        
        # Save model
        print("\nSaving model...")
        model_dir = ensure_model_directory()
        model_path = os.path.join(model_dir, 'printer_model.pkl')
        joblib.dump(best_model, model_path)
        print(f"Model saved to: {model_path}")
        
        # Store feature names
        best_model.feature_names_in_ = list(X.columns)
        
        return best_model
        
    except Exception as e:
        print(f"Error during model training: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        model = train_model()
        print("Model training completed successfully!")
    except Exception as e:
        print(f"Failed to train model: {str(e)}")
        exit(1)
