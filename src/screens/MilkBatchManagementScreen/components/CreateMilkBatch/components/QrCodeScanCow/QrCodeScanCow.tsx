import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { CommonActions, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { t } from 'i18next';
import { RootState } from '@core/store/store';

type QrCodeScanCowProps = {
  params: {
    screens: string;
  };
};

const QrCodeScanCow = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<QrCodeScanCowProps>>();

  // Reset hasScanned when the screen is focused to allow re-scanning
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setHasScanned(false);
    });
    return unsubscribe;
  }, [[navigation]]);

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
    if (hasScanned) return;
    const cowIdMatch = scannedData.match(/\/cow-management\/(\d+)/);
    if (cowIdMatch) {
      const extractedCowId = Number(cowIdMatch[1]);
      setHasScanned(true);
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'CreateMilkBatch' },
            {
              name: 'DetailFormMilk',
              params: { cowId: extractedCowId, screens: route.params.screens },
            },
          ],
        })
      );
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
        <View style={styles.overlay} />
        <View style={styles.scanWindow}>
          <Text style={styles.scanText}>{t('scanQR.scan_text')}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>{t('scanQR.flip_camera')}</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>{t('scanQR.cancel')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    left: '35%',
    transform: [{ translateX: -75 }],
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  message: { color: 'white', marginBottom: 20, fontSize: 18 },
  camera: { width: '100%', height: '100%' },
  buttonText: { color: 'white', fontSize: 18 },
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
  scanText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

export default QrCodeScanCow;
