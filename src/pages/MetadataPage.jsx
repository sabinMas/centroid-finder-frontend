// Placeholder for the Metadata page. A later task replaces this file's contents.
import { Container, Typography } from '@mui/material';

/**
 * Stub page that shows its title and "Coming soon".
 *
 * @returns {JSX.Element}
 */
export function MetadataPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Metadata
      </Typography>
      <Typography color="text.secondary">Coming soon</Typography>
    </Container>
  );
}
