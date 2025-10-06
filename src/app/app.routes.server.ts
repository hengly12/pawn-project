import { RenderMode, ServerRoute } from '@angular/ssr'; 
 
export const serverRoutes: ServerRoute[] = [ 
  { 
    path: 'home/:statusKey/listing', 
    renderMode: RenderMode.Server 
  }, 
  { 
    path: 'home/:statusKey/listing/create-form/:id', 
    renderMode: RenderMode.Server 
  }, 
  { 
    path: '**', 
    renderMode: RenderMode.Server 
  } 
];