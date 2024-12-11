interface VehicleModel {
  name: string;
  image: string;
}

interface VehicleMake {
  name: string;
  models: VehicleModel[];
}

export const DEFAULT_VEHICLE_IMAGE = 'https://aiautomationsstorage.blob.core.windows.net/cbl/sample-vehicle.png';

export const getColorHex = (colorName: string): string => {
  const color = vehicleColors.find(c => c.name === colorName);
  return color ? color.hex : '#000000';
};

export const getVehicleImage = (make: string, model: string): string => {
  const vehicleMake = vehicleMakes.find(m => m.name === make);
  if (!vehicleMake) return DEFAULT_VEHICLE_IMAGE;
  
  const vehicleModel = vehicleMake.models.find(m => m.name === model);
  return vehicleModel ? vehicleModel.image : DEFAULT_VEHICLE_IMAGE;
};

export const getModelsByMake = (make: string): string[] => {
  const vehicleMake = vehicleMakes.find(m => m.name === make);
  return vehicleMake ? vehicleMake.models.map(model => model.name) : [];
};

export const vehicleColors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Dark Blue', hex: '#00008B' },
  { name: 'Green', hex: '#008000' },
  { name: 'Dark Green', hex: '#006400' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Pearl White', hex: '#F0EAD6' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Champagne', hex: '#F7E7CE' },
  { name: 'Bronze', hex: '#CD7F32' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#800080' }
];

export const vehicleMakes: VehicleMake[] = [
  {
    name: 'Toyota',
    models: [
      { name: 'Camry', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/toyota-camry.png' },
      { name: 'Corolla', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'RAV4', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Highlander', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Prius', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Tacoma', image: DEFAULT_VEHICLE_IMAGE },
      { name: '4Runner', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Sienna', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Tundra', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Land Cruiser', image: DEFAULT_VEHICLE_IMAGE }
    ]
  },
  {
    name: 'Honda',
    models: [
      { name: 'Accord', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/honda-accord.png' },
      { name: 'Civic', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'CR-V', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Pilot', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'HR-V', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Odyssey', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Ridgeline', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Passport', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Insight', image: DEFAULT_VEHICLE_IMAGE }
    ]
  },
  {
    name: 'Ford',
    models: [
      { name: 'F-150', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/ford-f150.png' },
      { name: 'Escape', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Explorer', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Edge', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Mustang', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Bronco', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Expedition', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Ranger', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Maverick', image: DEFAULT_VEHICLE_IMAGE }
    ]
  },
  {
    name: 'Chevrolet',
    models: [
      { name: 'Silverado', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/chevrolet-silverado.png' },
      { name: 'Equinox', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/chevrolet-equinox.png' },
      { name: 'Tahoe', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/chevrolet-tahoe.png' },
      { name: 'Traverse', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/chevrolet-traverse.png' },
      { name: 'Malibu', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/chevrolet-malibu.png' },
      { name: 'Camaro', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/chevrolet-camaro.png' },
      { name: 'Suburban', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/chevrolet-suburban.png' },
      { name: 'Colorado', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/chevrolet-colorado.png' },
      { name: 'Blazer', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/chevrolet-blazer.png' }
    ]
  },
  {
    name: 'Nissan',
    models: [
      { name: 'Altima', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/nissan-altima.png' },
      { name: 'Sentra', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Rogue', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Maxima', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Pathfinder', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Frontier', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Murano', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Kicks', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Armada', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/nissan-armada.png' }
    ]
  },
  {
    name: 'Hyundai',
    models: [
      { name: 'Elantra', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/hyundai-elantra.png' },
      { name: 'Sonata', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/hyundai-sonata.png' },
      { name: 'Tucson', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/hyundai-tucson.png' },
      { name: 'Santa Fe', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/hyundai-santa-fe.png' },
      { name: 'Kona', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/hyundai-kona.png' },
      { name: 'Palisade', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/hyundai-palisade.png' },
      { name: 'Venue', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/hyundai-venue.png' },
      { name: 'Accent', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/hyundai-accent.png' }
    ]
  },
  {
    name: 'Kia',
    models: [
      { name: 'Forte', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/kia-forte.png' },
      { name: 'K5', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/kia-k5.png' },
      { name: 'Sportage', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/kia-sportage.png' },
      { name: 'Telluride', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/kia-telluride.png' },
      { name: 'Sorento', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/kia-sorento.png' },
      { name: 'Soul', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/kia-soul.png' },
      { name: 'Seltos', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/kia-seltos.png' },
      { name: 'Carnival', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/kia-carnival.png' }
    ]
  },
  {
    name: 'BMW',
    models: [
      { name: '3 Series', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/bmw-3-series.png' },
      { name: '5 Series', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/bmw-5-series.png' },
      { name: 'X3', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/bmw-x3.png' },
      { name: 'X5', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/bmw-x5.png' },
      { name: 'X1', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/bmw-x1.png' },
      { name: '7 Series', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/bmw-7-series.png' },
      { name: 'X7', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/bmw-x7.png' },
      { name: 'M3', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/bmw-m3.png' },
      { name: 'M5', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/bmw-m5.png' }
    ]
  },
  {
    name: 'Mercedes-Benz',
    models: [
      { name: 'C-Class', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mercedes-benz-c-class.png' },
      { name: 'E-Class', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mercedes-benz-e-class.png' },
      { name: 'GLC', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mercedes-benz-glc.png' },
      { name: 'GLE', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mercedes-benz-gle.png' },
      { name: 'A-Class', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mercedes-benz-a-class.png' },
      { name: 'S-Class', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mercedes-benz-s-class.png' },
      { name: 'GLA', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mercedes-benz-gla.png' },
      { name: 'GLB', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mercedes-benz-glb.png' },
      { name: 'GLS', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mercedes-benz-gls.png' }
    ]
  },
  {
    name: 'Audi',
    models: [
      { name: 'A4', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/audi-a4.png' },
      { name: 'Q5', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/audi-q5.png' },
      { name: 'A6', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/audi-a6.png' },
      { name: 'Q7', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/audi-q7.png' },
      { name: 'A3', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/audi-a3.png' },
      { name: 'Q3', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/audi-q3.png' },
      { name: 'Q8', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/audi-q8.png' },
      { name: 'e-tron', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/audi-e-tron.png' },
      { name: 'RS Q8', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/audi-rs-q8.png' }
    ]
  },
  {
    name: 'Lexus',
    models: [
      { name: 'RX', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/lexus-rx.png' },
      { name: 'ES', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/lexus-es.png' },
      { name: 'NX', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/lexus-nx.png' },
      { name: 'IS', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/lexus-is.png' },
      { name: 'GX', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/lexus-gx.png' },
      { name: 'UX', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/lexus-ux.png' },
      { name: 'LS', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/lexus-ls.png' },
      { name: 'LC', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/lexus-lc.png' },
      { name: 'LX', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/lexus-lx.png' }
    ]
  },
  {
    name: 'Volkswagen',
    models: [
      { name: 'Jetta', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/volkswagen-jetta.png' },
      { name: 'Tiguan', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/volkswagen-tiguan.png' },
      { name: 'Atlas', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/volkswagen-atlas.png' },
      { name: 'Passat', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/volkswagen-passat.png' },
      { name: 'Taos', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/volkswagen-taos.png' },
      { name: 'Golf', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/volkswagen-golf.png' },
      { name: 'ID.4', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/volkswagen-id4.png' },
      { name: 'Arteon', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/volkswagen-arteon.png' }
    ]
  },
  {
    name: 'Subaru',
    models: [
      { name: 'Outback', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/subaru-outback.png' },
      { name: 'Forester', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/subaru-forester.png' },
      { name: 'Crosstrek', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/subaru-crosstrek.png' },
      { name: 'Ascent', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/subaru-ascent.png' },
      { name: 'Impreza', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/subaru-impreza.png' },
      { name: 'Legacy', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/subaru-legacy.png' },
      { name: 'WRX', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/subaru-wrx.png' },
      { name: 'BRZ', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/subaru-brz.png' }
    ]
  },
  {
    name: 'Mazda',
    models: [
      { name: 'CX-5', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mazda-cx5.png' },
      { name: 'CX-30', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mazda-cx30.png' },
      { name: 'Mazda3', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mazda3.png' },
      { name: 'CX-9', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mazda-cx9.png' },
      { name: 'Mazda6', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mazda6.png' },
      { name: 'MX-5 Miata', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mazda-mx5-miata.png' },
      { name: 'CX-50', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/mazda-cx50.png' }
    ]
  },
  {
    name: 'Jeep',
    models: [
      { name: 'Grand Cherokee', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/jeep-grand-cherokee.png' },
      { name: 'Cherokee', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/jeep-cherokee.png' },
      { name: 'Wrangler', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/jeep-wrangler.png' },
      { name: 'Compass', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/jeep-compass.png' },
      { name: 'Gladiator', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/jeep-gladiator.png' },
      { name: 'Renegade', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/vehicles/jeep-renegade.png' }
    ]
  },
  {
    name: 'Mitsubishi',
    models: [
      { name: 'Outlander', image: 'https://aiautomationsstorage.blob.core.windows.net/cbl/mitsubishi-outlander.png' },
      { name: 'Eclipse Cross', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Mirage', image: DEFAULT_VEHICLE_IMAGE },
      { name: 'Outlander Sport', image: DEFAULT_VEHICLE_IMAGE }
    ]
  }
];
