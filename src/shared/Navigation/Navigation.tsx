'use client';

import React from 'react';
import NavigationItem from './NavigationItem';
import { useMenu } from '@/hooks/useMenu';

function Navigation() {
  const items = useMenu('header');
  return (
    <ul className="flex items-center nc-Navigation">
      {items.map((item) => (
        <NavigationItem key={item.id} menuItem={item} />
      ))}
    </ul>
  );
}

export default Navigation;
