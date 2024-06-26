import HeaderHome from "./navbar";
import '../styles/home.css'; // Importe le fichier CSS

const Error = () => {
    return (
        <div>
            <div className="header-wrapper">
                <HeaderHome />
            </div>
            <div className="container">
                <div className="headerHome">
                    <h1  className="error-message">
                        Oups 🙈 Vous n'êtes pas autorisé à accéder à cette application
                    </h1>
                </div>
            </div>
        </div>
    );
}

export default Error;
