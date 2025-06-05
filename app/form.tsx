// import React, { useState } from 'react';
// import ReactDOM from 'react-dom/client';
// import { FlightForm } from './flightForm';
// import { FlightFormData } from './types/types';

// export const App = () => {
//   const [mensaje, setMensaje] = useState<string | null>(null);
 
//   const handleFormSubmit = async (data: FlightFormData) => {
//     console.log('Datos enviados:', data);
//     await fetch('http://localhost:3040/api/captando', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     });

//     // Pedir la data actualizada al backend
//     const response = await fetch('http://localhost:3040/api/mensaje');
//     const result = await response.json();
//     setMensaje(result.mensaje); // Este mensaje sí tiene la data
//   };
//    console.log('Mensaje recibido:', mensaje);
//   return (
//     <div>
//       <FlightForm onSubmit={handleFormSubmit} />
//     </div>
//   );
// };

// const root = ReactDOM.createRoot(document.getElementById('root')!);
// root.render(<App />);
