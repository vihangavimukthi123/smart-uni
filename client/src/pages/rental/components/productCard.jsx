//create new tag to easy work
export default function ProductCard(props){
    console.log(props)

    return(
        <div>
            <h1>{props.name}</h1>
            <img src = {props.image}/>
            <p>{props.price}</p>
        </div>
    )
}
