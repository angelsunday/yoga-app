function ClassCard(props) {
    const isLow = props.spots <= 3
    const isFull = props.spots === 0

    return (
        <div className="card">
            <div className="card-top">
                <h3 className="card-name">{props.name}</h3>
                <span className={isLow ? 'badge badge-low' : 'badge'}>{isFull ? 'Γεμάτο' : `${props.spots} θέσεις`}</span>
            </div>
            <p className="card-meta">{props.time}</p>
            <button className="book-btn" onClick={props.onBook} disabled={isFull}>{isFull ? 'Δεν υπάρχουν θέσεις' : 'Κράτηση'}
            </button>
        </div>
    )
}

export default ClassCard