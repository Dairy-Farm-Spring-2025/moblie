export const getIconByAreaType = (areaType: string) => {
  console.log(areaType);
  switch (areaType) {
    case 'warehouse':
      return { name: 'storefront-outline', color: '#F4A261' }; // Warm orange
    case 'cowHousing':
      return { name: 'paw-outline', color: '#2A9D8F' }; // Teal green
    case 'milkingParlor':
      return { name: 'water-outline', color: '#264653' }; // Dark blue
    default:
      return { name: 'home-outline', color: '#6C757D' }; // Neutral gray
  }
};
