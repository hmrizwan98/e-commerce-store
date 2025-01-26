import React from 'react';
import NavigationItem from './NavigationItem';
// import navigation from '@/data/navigation';
import { useAppSelector } from '@/utils/hooks/store';
import useNavigationHook from '@/data/useNavigationHook';

function Navigation() {
  const { NAVIGATION_DEMO_2 } = useNavigationHook();
  const navigation = useAppSelector((state) => state.homePage);
  console.log('_____navigation', navigation);
  return (
    <ul className="flex items-center nc-Navigation">
      {NAVIGATION_DEMO_2.map((item) => (
        <NavigationItem key={item.id} menuItem={item} />
      ))}
    </ul>
  );
}

export default Navigation;
