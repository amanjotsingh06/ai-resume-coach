import React from 'react';
import MatchScoreRing from '../dashboard/MatchScoreRing';

export default function MiniScoreRing({ size = 'sm', ...props }) {
  return <MatchScoreRing size={size} {...props} />;
}
