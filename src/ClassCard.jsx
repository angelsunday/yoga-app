function ClassCard(props) {
    const isLow = props.spots <= 3
    return (
        <div className="card">
            <div className="card-top">
                <h3 className="card-name">{props.name}</h3>
                <span className={isLow ? 'badge badge-low' : 'badge'}>{props.spots} θέσεις</span>
            </div>
            <p className="card-meta">{props.time}</p>
        </div>
    )
}

export default ClassCard