import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { LockFill, PersonFill } from 'react-bootstrap-icons';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await login(username, password);

            switch (userData.role) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'technician':
                    navigate('/repairs');
                    break;
                case 'employee':
                    navigate('/my-assets');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            setError('Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container
            fluid
            className="d-flex align-items-center justify-content-center"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #4e73df, #1cc88a)"
            }}
        >
            <Card
                className="shadow-lg border-0 rounded-4"
                style={{ width: '100%', maxWidth: '420px' }}
            >
                <Card.Body className="p-5">

                    {/* HEADER */}
                    <div className="text-center mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center mb-3"
                            style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #4e73df, #1cc88a)",
                                color: "white"
                            }}
                        >
                            <LockFill size={26} />
                        </div>

                        <h3 className="fw-bold mb-1">ASSET_PRO</h3>
                        <small className="text-muted">Secure Gateway</small>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <Alert variant="danger" className="text-center py-2 small">
                            {error}
                        </Alert>
                    )}

                    {/* FORM */}
                    <Form onSubmit={handleSubmit}>

                        {/* USERNAME */}
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-semibold">
                                Username
                            </Form.Label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0">
                                    <PersonFill />
                                </span>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter username"
                                    className="bg-light border-0"
                                    autoComplete="username"
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </Form.Group>

                        {/* PASSWORD */}
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-semibold">
                                Password
                            </Form.Label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0">
                                    <LockFill />
                                </span>
                                <Form.Control
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-light border-0"
                                    autoComplete="current-password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </Form.Group>

                        {/* BUTTON */}
                        <Button
                            type="submit"
                            className="w-100 fw-bold py-2"
                            style={{
                                background: "linear-gradient(135deg, #4e73df, #1cc88a)",
                                border: "none"
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </Form>
                </Card.Body>

                <Card.Footer className="bg-white border-0 text-center pb-4">
                    <small className="text-muted">
                        © 2026 Asset Management System
                    </small>
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default Login;