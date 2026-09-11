import { useState, useEffect } from 'react';
import { API_URL } from '../api/config';

function AnimalCatalogo() {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [especies,setEspecies] = useState([]);
  const [recintos,setRecintos] = useState([]);
  const [especieId, setEspecieId] = useState('');
  const [recintoId, setRecintoId] = useState(''); 

  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);

  const [autor, setAutor] = useState('');
  const [calificacion, setCalificacion] = useState('5');
  const [texto, setTexto] = useState('');
  const [errorFormulario, setErrorFormulario] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/especies`)
      .then((res) => res.json())
      .then((data) => setEspecies(data));

    fetch(`${API_URL}/recintos`)
      .then((res) => res.json())
      .then((data) => setRecintos(data));
  }, []);

    useEffect(() => {
    const params = new URLSearchParams();
    if (especieId) params.append('especieId', especieId);
    if (recintoId) params.append('recintoId', recintoId);

    fetch(`${API_URL}/animals?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setAnimales(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudo conectar con el servidor');
        setCargando(false);
      });
  }, [especieId, recintoId]);

   useEffect(() => {
    if (!animalSeleccionado) return;

    fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`)
      .then((res) => res.json())
      .then((data) => setComentarios(data.comentarios));
  }, [animalSeleccionado]);

  const seleccionarAnimal = (animal) => {
    setAnimalSeleccionado(animal);
    setComentarios([]);
    setErrorFormulario(null);
  };

  const crearComentario = async (e) => {
    e.preventDefault();
    setErrorFormulario(null);

    try {
      const res = await fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autor,
          calificacion: Number(calificacion),
          comentario: texto,
        }),
      });
      const data = await res.json();

      if (res.status === 400) {
        setErrorFormulario(data.detalles.map((d) => d.mensaje).join('. '));
        return;
      }

      if (!res.ok) {
        setErrorFormulario(data.error);
        return;
      }

      setComentarios([data, ...comentarios]);
      setAutor('');
      setCalificacion('5');
      setTexto('');
    } catch {
      setErrorFormulario('No se pudo conectar con el servidor');
    }
  };

  if (cargando) return <p>Cargando animales...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Animales</h2>

      <select value={especieId} onChange={(e) => setEspecieId(e.target.value)}>
        <option value="">Todas las especies</option>
        {especies.map((especie) => (
          <option key={especie.id} value={especie.id}>
            {especie.nombre}
          </option>
        ))}
      </select>

      <select value={recintoId} onChange={(e) => setRecintoId(e.target.value)}>
        <option value="">Todos los recintos</option>
        {recintos.map((recinto) => (
          <option key={recinto.id} value={recinto.id}>
            {recinto.nombre}
          </option>
        ))}
      </select>

      <ul>
        {animales.map((animal) => (
          <li
            key={animal.id}
            onClick={() => seleccionarAnimal(animal)}
            style={{ cursor: 'pointer' }}
          >
            {animal.nombre} — {animal.especie.nombre} ({animal.recinto.nombre})
          </li>
        ))}
      </ul>

      {animalSeleccionado && (
        <div>
          <h3>{animalSeleccionado.nombre}</h3>
          <p>Especie: {animalSeleccionado.especie.nombre}</p>
          <p>Recinto: {animalSeleccionado.recinto.nombre}</p>
          <p>Edad: {animalSeleccionado.edad} años</p>
          <p>Peso: {animalSeleccionado.peso ? `${animalSeleccionado.peso} kg` : 'Sin registro'}</p>
          <p>Disponible: {animalSeleccionado.disponible ? 'Sí' : 'No'}</p>

          <h4>Comentarios</h4>
          {comentarios.length === 0 ? (
            <p>Este animal aún no tiene comentarios.</p>
          ) : (
            <ul>
              {comentarios.map((c) => (
                <li key={c.id}>
                  {c.autor} ({c.calificacion}/5): {c.comentario}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={crearComentario}>
            <input
              placeholder="Tu nombre"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
            />
            <select value={calificacion} onChange={(e) => setCalificacion(e.target.value)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Comentario"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <button type="submit">Enviar comentario</button>
          </form>

          {errorFormulario && <p style={{ color: 'red' }}>{errorFormulario}</p>}
        </div>
      )}
    </div>
  );
}
export default AnimalCatalogo;