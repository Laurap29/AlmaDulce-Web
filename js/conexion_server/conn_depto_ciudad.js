fetch('http://localhost:3000/api/dc/departamento') 
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById('departamento');
        data.forEach(element => {
            const option = document.createElement('option');
            option.value = element.id_departamento; 
            option.text = element.nombre_departamento;
            select.appendChild(option);
        })
        select.addEventListener('change', (event) => {
            const valorSeleccion = event.target.value
            enviarSeleccion(valorSeleccion)

        })
    })
    .catch(err => console.error('Error al cargar los departamentos:', err))
       

function enviarSeleccion(value) {
    const select = document.getElementById('ciudad')
    if (value === '') {
        select.innerHTML = '<option value="">Seleccione una ciudad</option>'
        return 
    } 
    fetch (`http://localhost:3000/api/dc/ciudades/${value}`)
        .then(res => res.json())
        .then(data => {
            if(data.length === 0) {
                select.innerHTML = '<option value="">Seleccionar...</option>'
            }else{
                select.innerHTML = '<option value="">Seleccionar...</option>'
                data.forEach(element => {
                    const option = document.createElement('option')
                    option.value = element.id_ciudades
                    option.text = element.nombre_ciudades
                    select.appendChild(option)
                })
            }
        })
        .catch(err => console.error('Error al cargar las ciudades:', err))

}