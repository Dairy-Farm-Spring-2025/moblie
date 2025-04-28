import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import { set } from 'date-fns';
import LoadingSplashScreen from '@screens/SplashScreen/LoadingSplashScreen';
import { t } from 'i18next';

type QrCodeScanProps = {
  selectedField: string;
  roleName: string;
};

const fetchCowDetails = async (cowId: number): Promise<Cow> => {
  const response = await apiClient.get(`/cows/${cowId}`);
  return response.data;
};

const QrCodeScan = ({ selectedField, roleName }: QrCodeScanProps) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setIsCameraActive(true);
      setHasScanned(false); // Reset hasScanned when screen gains focus
    } else {
      setIsCameraActive(false);
      setIsCameraReady(false);
      setHasScanned(false); // Ensure reset when screen loses focus
    }
  }, [isFocused]);

  if (!permission) return <View />;
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

  const navigationMap: {
    [key: string]: (navigate: any, cowId: number) => void;
  } = {
    'cow-detail': (navigate, cowId) => {
      navigate('CowDetails', { cowId });
    },
    'create-health-record': (navigate, cowId) => {
      navigate('CowHealthRecord', { cowId });
    },
    'report-illness': async (navigate, cowId) => {
      try {
        setIsLoading(true);
        const cow = await fetchCowDetails(cowId);
        if (roleName.toLocaleLowerCase() === 'veterinarians') {
          navigate('IllnessReportScreen', { cow });
        } else {
          navigate('IllnessReportForm', { cow });
        }
      } catch (error) {
        setErrorMessage('Error fetching cow details');
        setTimeout(() => {
          navigate('Home');
          setErrorMessage(null);
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    },
  };

  const navigateScreenByField = async ({
    selectedField,
    navigate,
    cowId,
  }: {
    selectedField: string;
    navigate: any;
    cowId: number;
  }) => {
    if (!cowId) {
      setErrorMessage('Invalid QR code format');
      setTimeout(() => {
        navigate('Home');
        setErrorMessage(null);
      }, 2000);
      return;
    }

    const navigateFn = navigationMap[selectedField];
    if (navigateFn) {
      await navigateFn(navigate, cowId);
    } else {
      setErrorMessage('Unsupported field');
      setTimeout(() => {
        navigate('Home');
        setErrorMessage(null);
      }, 2000);
    }
  };

  const handleScanQRCode = async (scannedData: string) => {
    if (!isCameraReady) {
      return;
    }
    if (hasScanned) {
      return;
    }

    const cowIdMatch = scannedData.match(/\/cow-management\/(\d+)/);
    if (cowIdMatch) {
      const cowId = Number(cowIdMatch[1]);
      setHasScanned(true); // Prevent further scans
      await navigateScreenByField({
        selectedField,
        navigate: navigation.navigate,
        cowId,
      });
    } else {
      setErrorMessage('Invalid QR code format');
      setTimeout(() => {
        (navigation.navigate as any)('Home');
        setErrorMessage(null);
      }, 2000);
    }
  };

  const toggleCameraFacing = () => setFacing((current) => (current === 'back' ? 'front' : 'back'));
  const handleCancel = () => {
    setIsCameraActive(false);
    (navigation.navigate as any)('Home');
  };

  return isLoading ? (
    <LoadingSplashScreen />
  ) : (
    <View style={styles.container}>
      {isCameraActive && (
        <CameraView
          facing={facing}
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => handleScanQRCode(data)}
          onCameraReady={() => {
            setIsCameraReady(true);
          }}
        >
          <View style={styles.overlay} />
          <View style={styles.scanWindow}>
            <Text style={styles.scanText}>{t('scanQR.scan_text')}</Text>
          </View>
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>{t('scanQR.flip_camera')}</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
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
    left: '50%',
    transform: [{ translateX: -130 }],
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
  errorText: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
});

export default QrCodeScan;
