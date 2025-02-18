import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native'; // Import useIsFocused hook

type QrCodeScanProps = {
  params: {
    screens: string;
  };
};

const QrCodeScan = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCameraActive, setIsCameraActive] = useState(false); // Set to false initially
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook to check if the screen is focused

  const route = useRoute<RouteProp<QrCodeScanProps>>();

  useEffect(() => {
    if (isFocused) {
      setIsCameraActive(true); // Activate the camera when the screen is focused
    } else {
      setIsCameraActive(false); // Deactivate the camera when the screen is blurred
    }
  }, [isFocused]); // Re-run when the screen focus state changes

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
    console.log('Scanned Data:', scannedData);

    if (scannedData.includes('/cow-management/')) {
      const cowIdMatch = scannedData.match(/\/cow-management\/(\d+)/);
      if (cowIdMatch) {
        const cowId = Number(cowIdMatch[1]);
        (navigation.navigate as any)('CowDetails', { cowId });
      }
    } else if (scannedData.includes('/health-management/')) {
      const healthIdMatch = scannedData.match(/\/health-management\/(\d+)/);
      if (healthIdMatch) {
        const healthId = Number(healthIdMatch[1]);
        (navigation.navigate as any)('HealthDetailScreen', { healthId });
      }
    } else {
      alert('Unknown QR code format');
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  function handleCancel() {
    setIsCameraActive(false);
    (navigation.navigate as any)('Home');
  }

  return (
    <View style={styles.container}>
      {isCameraActive && (
        <CameraView
          facing={facing}
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={({ data }) => handleScanQRCode(data)}
        >
          <View style={styles.overlay} />
          <View style={styles.scanWindow}>
            <Text style={styles.scanText}>Scan within this area</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}

      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
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
    bottom: 100,
    left: '45%',
    transform: [{ translateX: -75 }],
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
  },
  scanText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

export default QrCodeScan;
