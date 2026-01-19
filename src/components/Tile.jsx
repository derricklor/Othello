const Tile=({color, onClick, isAvailable}) => {
    let colorClass = 'bg-gray-200 dark:bg-gray-600';
    if (color === 'black') {
        colorClass = 'bg-black';
    } else if (color === 'white') {
        colorClass = 'bg-white';
    }
    return (
        <div>
            <button onClick={onClick} 
            disabled={color !== null}
            className={`size-[10dvh] ${colorClass} border border-gray-300 rounded-3xl 
            ${isAvailable ? 'inset-ring-4 inset-ring-yellow-400' : ''}`}>
                
            </button>
        </div>
    );
}

export default Tile;