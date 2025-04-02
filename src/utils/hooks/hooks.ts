// hooks/useRoleColor.ts
import { COLORS } from '@common/GlobalStyle';
import { useSelector } from 'react-redux';

// Define the RootState type (adjust according to your Redux store structure)
interface RootState {
  auth: {
    roleName: string;
  };
}

// Custom hook to return a color based on role
const useRoleColor = () => {
  const { roleName } = useSelector((state: RootState) => state.auth);
  const getColorByRole = () => {
    switch (roleName.toLowerCase()) {
      case 'veterinarians':
        return COLORS.veterinarian.primary;
      case 'workers':
        return COLORS.worker.primary;
      default:
        return COLORS.worker.primary;
    }
  };

  return getColorByRole();
};

export default useRoleColor;
