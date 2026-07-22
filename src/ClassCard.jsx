function ClassCard(props) {
    return (
        <div className="card">
            <div className="card-top">
                <h3 className="card-name">{props.name}</h3>
                <span className="badge">Κενές Θέσεις: {props.spots}</span>
            </div>
            <p className="card-meta">{props.time}</p>
        </div>
    )
}

export default ClassCard