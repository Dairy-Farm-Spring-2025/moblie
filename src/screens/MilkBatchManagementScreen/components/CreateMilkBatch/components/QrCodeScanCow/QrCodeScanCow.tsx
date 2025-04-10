import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

type QrCodeScanCowProps = {
  params: {
    screens: string;
  };
};

const QrCodeScanCow = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false); // New state to track scanning
  const navigation = useNavigation();
  const route = useRoute<RouteProp<QrCodeScanCowProps>>();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScanQRCode = (scannedData: string) => {
    if (hasScanned) return; // Ignore if already scanned
    const cowIdMatch = scannedData.match(/\/cow-management\/(\d+)/);
    if (cowIdMatch) {
      const extractedCowId = Number(cowIdMatch[1]);
      setHasScanned(true); // Mark as scanned
      (navigation.navigate as any)(route.params.screens, {
        cowId: extractedCowId,
      });
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView
        facing={facing}
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={({ data }) => handleScanQRCode(data)}
      >
        {/* Black overlay for the rest of the camera area */}
        <View style={styles.overlay} />

        {/* Scanning area window */}
        <View style={styles.scanWindow}>
          <Text style={styles.scanText}>Scan within this area</Text>
        </View>

        {/* The camera view will have the "Flip Camera" button at the bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100, // Align at the bottom of the screen
    left: '45%',
    transform: [{ translateX: -75 }], // Center the button horizontally
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  message: {
    color: 'white',
    marginBottom: 20,
    fontSize: 18,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  cancelButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  // Styling the scanning window
  scanWindow: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    right: '10%',
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent background
    borderRadius: 10,
  },
  scanText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  // Black overlay for the rest of the camera area
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black overlay
  },
});

export default QrCodeScanCow;
