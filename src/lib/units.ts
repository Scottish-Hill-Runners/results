function scale(factor: number, decimals: number) {
  return (d: number) => (d / factor).toFixed(decimals)
}

export const metric: { distance: ScaleFactor, ascent: ScaleFactor } = {
  distance: { unit: 'km', scale: scale(1, 0) },
  ascent: { unit: 'm', scale: scale(1, 0) }
};

export const imperial: { distance: ScaleFactor, ascent: ScaleFactor } = {
  distance: { unit: 'mile', scale: scale(1.609344, 1) },
  ascent: { unit: 'foot', scale: scale(0.3048, 0) }
};
