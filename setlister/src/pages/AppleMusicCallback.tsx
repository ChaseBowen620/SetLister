import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress } from '@mui/material';

const AppleMusicCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Apple Music uses a different authentication flow
        // We'll implement the token handling later
        // This might involve handling a JWT token or other authentication method
        console.log('Handling Apple Music authentication');
        navigate('/');
      } catch (err) {
        setError('Failed to authenticate with Apple Music');
        console.error('Apple Music authentication error:', err);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress />
    </Container>
  );
};

export default AppleMusicCallback; 