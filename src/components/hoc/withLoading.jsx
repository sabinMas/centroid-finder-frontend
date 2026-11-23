// This is the required higher-order component (HOC) for the assignment.
import { CircularProgress, Box } from '@mui/material';

/**
 * Wraps a component so it renders a loading spinner whenever its `loading` prop
 * is true, and the wrapped component otherwise.
 *
 * @param {React.ComponentType} WrappedComponent
 * @returns {React.ComponentType} a component accepting the same props plus `loading`
 */
export function withLoading(WrappedComponent) {
  return function WithLoading({ loading, ...props }) {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
          <CircularProgress />
        </Box>
      );
    }
    return <WrappedComponent {...props} />;
  };
}
