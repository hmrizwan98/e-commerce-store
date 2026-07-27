export interface AnnouncementBar {
  id: string;
  title: string;
  subtitle?: string;
  textColor: string;
  backgroundColor: string;
  buttonText?: string;
  buttonHref?: string;
  autoScroll: boolean;
  isClosable: boolean;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  /** Epoch ms. Unset on either end means "no bound" on that side. */
  startDate?: number | null;
  endDate?: number | null;
  /** Higher priority wins when multiple bars are active at once. */
  priority: number;
  isActive: boolean;
  order: number;
  createdAt?: number;
  updatedAt?: number;
}
