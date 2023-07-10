function scale(factor: number, decimals: number) {
  return (d: number) => (d / factor).toFixed(decimals)
}

const imperialUnits = {
  "ascent": [
    { unit: 'hand', scale: scale(0.1016, 0) },
    { unit: 'foot', scale: scale(0.3048, 0) },
    { unit: 'step', scale: scale(0.74, 0) },
    { unit: 'pace', scale: scale(0.75, 0) },
    { unit: 'yard', scale: scale(0.9144, 0) },
    { unit: 'horse', scale: scale(2.4, 0) },
    { unit: 'rod', scale: scale(5.0292, 0) },
    { unit: 'lug', scale: scale(4.572, 0) },
    { unit: 'lug', scale: scale(5.4864, 0) },
    { unit: 'lug', scale: scale(6.096, 0) },
    { unit: 'lug', scale: scale(6.4008, 0) },
    { unit: 'chain', scale: scale(20.1168, 0) }
  ],
  "distance": [
    { unit: 'chain', scale: scale(0.0201168, 0) },
    { unit: 'furlong', scale: scale(0.201, 0) },
    { unit: 'mile', scale: scale(1.609344, 1) }
  ]
};

function any(units: ScaleFactor[]): ScaleFactor {
  return units[units.length * Math.random() << 0];
}

export const metric: { distance: ScaleFactor, ascent: ScaleFactor } = {
  distance: { unit: 'km', scale: scale(1, 0) },
  ascent: { unit: 'm', scale: scale(1, 0) }
};

export function imperial(): { distance: ScaleFactor, ascent: ScaleFactor } {
  return { distance: any(imperialUnits.distance), ascent: any(imperialUnits.ascent) };
}
