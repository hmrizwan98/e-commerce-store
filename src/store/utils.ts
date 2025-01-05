export type ActionTracker = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMessage: string;
  successMessage: string;
};

export const initialActionTracker: ActionTracker = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMessage: '',
  successMessage: '',
};

export const initialActionTrackerLoading: ActionTracker = {
  isLoading: true,
  isError: false,
  isSuccess: false,
  errorMessage: '',
  successMessage: '',
};

export const handlePending = () => {
  return { ...initialActionTracker, isLoading: true };
};
export const handleSuccess = (message: any) => {
  return {
    ...initialActionTracker,
    isLoading: false,
    isSuccess: true,
    successMessage: message || 'Request completed successfully',
  };
};

export const handleFailure = (message: any) => {
  return {
    ...initialActionTracker,
    isError: true,
    isLoading: false,
    errorMessage: message || 'Failed to complete your request',
  };
};
