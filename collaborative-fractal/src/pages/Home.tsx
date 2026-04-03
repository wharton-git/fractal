
interface HomeProps {
    onNavigate: (page: 'Home' | 'Fractal') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    return (
        <div className='h-screen w-screen flex items-center justify-center bg-base-100'>
            <div className=''>
                <button
                    onClick={() => onNavigate('Fractal')}
                    className="btn btn-primary btn-outline"
                >
                    Simulate Fractal
                </button>
            </div>
        </div>
    )
}

export default Home