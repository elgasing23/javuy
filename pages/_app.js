import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Component {...pageProps} />
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    style: {
                        background: '#333',
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
                    },
                    success: {
                        iconTheme: {
                            primary: '#00d1b2',
                            secondary: 'black',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ff6b6b',
                            secondary: 'black',
                        },
                    },
                }}
            />
        </>
    );
}

export default MyApp;
