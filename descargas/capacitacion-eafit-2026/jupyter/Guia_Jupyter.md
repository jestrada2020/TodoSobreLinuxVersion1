---
author:
- Elaboracion practica para usuarios de Linux
date: 2026-06-19
title: |
  **GUIA JUPYTER**\
  Manual practico, completo y robusto\
  Notebook, Lab, kernels, extensiones y flujos de trabajo
---

**GUIA JUPYTER**\
Manual practico, completo y robusto\
Notebook, Lab, kernels, extensiones y flujos de trabajo\

------------------------------------------------------------------------


Version del documento: 1.0\
Fecha: 2026-06-19\
Sistema: Linux, macOS y Windows


# Introduccion a Jupyter

## Que es Jupyter?

Jupyter es un ecosistema de herramientas de codigo abierto para computacion interactiva y ciencia de datos. Su nombre proviene de los lenguajes que originalmente soportaba: **Ju**lia, **Pyt**hon y **R**.

El proyecto Jupyter incluye:

-   **Jupyter Notebook**: interfaz web clasicas de cuadernos.

-   **JupyterLab**: entorno de desarrollo integrado (IDE) web moderno.

-   **JupyterHub**: multiusuario para entornos corporativos y educativos.

-   **Kernels**: motores de ejecucion para diferentes lenguajes.

-   **Widgets**: controles interactivos en los cuadernos.

> **💡 Nota:**
> Jupyter permite combinar codigo ejecutable, texto explicativo, ecuaciones, visualizaciones y multimedia en un unico documento interactivo.

## Jupyter Notebook vs JupyterLab

  **Caracteristica**   **Jupyter Notebook**          **JupyterLab**
  -------------------- ----------------------------- ------------------------------------------
  Interfaz             Clasica, simple               Moderna, modular
  Paneles              Unico cuaderno a la vez       Multiples paneles
  Extensiones          Jupyter Notebook extensions   Extensions de JupyterLab
  IDE                  Basica                        Avanzada (terminales, editores, visores)
  Recomendado          Usuarios principiantes        Usuarios avanzados


## Requisitos previos

Antes de instalar Jupyter se recomienda contar con:

1.  Python 3.8 o superior.

2.  pip o conda instalado.

3.  Conexion a Internet.

4.  Un navegador web moderno.

# Instalacion y actualizacion

## Instalacion con pip

El metodo mas comun es usar pip:

```
# Instalar Jupyter con pip
pip install jupyter jupyterlab notebook
```

Para instalar solo Jupyter Notebook:

```
# Solo Jupyter Notebook
pip install notebook
```

Para instalar solo JupyterLab:

```
# Solo JupyterLab
pip install jupyterlab
```

## Instalacion con conda

Si usas Anaconda o Miniconda:

```
# Instalar Jupyter con conda
conda install -c conda-forge jupyterlab notebook
```

## Instalacion en Linux

### Ubuntu / Debian

```
# Instalacion en Ubuntu/Debian
sudo apt update
sudo apt install -y python3-pip python3-venv
pip3 install jupyter jupyterlab notebook
```

### Fedora / RHEL / CentOS

```
# Instalacion en Fedora/RHEL
sudo dnf install -y python3-pip
pip3 install jupyter jupyterlab notebook
```

### Arch Linux / Manjaro

```
# Instalacion en Arch Linux
sudo pacman -S python-pip
pip install jupyter jupyterlab notebook
```

## Instalacion en macOS

```
# Instalacion en macOS
brew install python3
pip3 install jupyter jupyterlab notebook
```

## Instalacion en Windows

Desde PowerShell o CMD:

```
# Instalacion en Windows
python -m pip install jupyter jupyterlab notebook
```

O usando Anaconda Navigator graficamente.

## Verificar la instalacion

```
# Verificar versiones
jupyter --version
jupyter notebook --version
jupyter lab --version
```

```
# Listar kernels disponibles
jupyter kernelspec list
```

## Actualizar Jupyter

```
# Actualizar con pip
pip install --upgrade jupyter jupyterlab notebook
```

```
# Actualizar con conda
conda update -c conda-forge jupyterlab notebook
```

# Primeros pasos

## Iniciar Jupyter Notebook

```
# Iniciar Jupyter Notebook
jupyter notebook
```

Por defecto abre el navegador en <http://localhost:8888>.

## Iniciar JupyterLab

```
# Iniciar JupyterLab
jupyter lab
```

JupyterLab tambien usa el puerto 8888 por defecto.

## Opciones utiles de inicio

```
# Iniciar sin abrir navegador
jupyter lab --no-browser
```

```
# Especificar puerto
jupyter notebook --port 9999
```

```
# Permitir acceso remoto
jupyter lab --ip=0.0.0.0 --no-browser
```

```
# Iniciar en una carpeta especifica
jupyter lab --notebook-dir=/ruta/al/proyecto
```

<figure id="fig:arquitectura">

<figcaption>Arquitectura basica de Jupyter</figcaption>
</figure>

# La interfaz de Jupyter Notebook

## Componentes principales

La interfaz de Jupyter Notebook consta de:

-   **Barra de menu**: File, Edit, View, Insert, Cell, Kernel, Help.

-   **Barra de herramientas**: botones para guardar, anadir celda, ejecutar, etc.

-   **Area de celdas**: donde se escribe codigo y texto.

-   **Panel lateral**: informacion del kernel y extensiones.

## Modos de edicion

Jupyter Notebook tiene dos modos:

Para operaciones sobre celdas completas.

Para escribir dentro de una celda.


## Atajos de teclado esenciales

  **Atajo**       **Accion**
  --------------- ----------------------------------
  Enter           Entrar en modo edicion
  Esc             Volver a modo comando
  Shift + Enter   Ejecutar celda y avanzar
  Ctrl + Enter    Ejecutar celda y quedarse
  Alt + Enter     Ejecutar celda e insertar debajo
  A               Insertar celda arriba
  B               Insertar celda abajo
  DD              Eliminar celda
  M               Convertir celda a Markdown
  Y               Convertir celda a codigo
  Z               Deshacer eliminacion de celda


# La interfaz de JupyterLab

## Areas de trabajo

JupyterLab organiza el trabajo en:

-   **Main Work Area**: area central con pestanas y paneles.

-   **Left Sidebar**: explorador de archivos, kernels, extensiones.

-   **Right Sidebar**: informacion de contexto.

-   **Menu Bar**: menus principales.

-   **Status Bar**: estado del kernel y del servidor.

## Ventajas de JupyterLab

-   Arrastrar y soltar archivos entre paneles.

-   Terminales integradas.

-   Editor de texto para archivos de codigo.

-   Visor de imagenes, CSV, JSON y otros formatos.

-   Extensiones con gestor visual.

> **✅ Tip:**
> Si empiezas con Jupyter, prueba primero Jupyter Notebook. Cuando necesites mas productividad, migra a JupyterLab.

# Celdas y kernels

## Tipos de celdas

Jupyter soporta tres tipos de celdas:

Para escribir y ejecutar codigo.

Para texto formateado, ecuaciones e imagenes.

Texto sin procesar, util para exportaciones.


## Markdown en Jupyter

Ejemplos de sintaxis Markdown:

```
# Ejemplos de Markdown
# Titulo
## Subtitulo
**negrita**
*cursiva*
`codigo`

- Elemento 1
- Elemento 2

[Este es un enlace](https://jupyter.org)

![Descripcion](imagen.png)

$E = mc^2$
```

## Kernels

Un kernel es el proceso que ejecuta el codigo. Jupyter soporta kernels para muchos lenguajes.

```
# Listar kernels
jupyter kernelspec list
```

```
# Instalar kernel de IPython
python -m ipykernel install --user --name python3 --display-name "Python 3"
```

```
# Instalar kernel de R
install.packages('IRkernel')
IRkernel::installspec(user = TRUE)
```

<figure id="fig:kernels">

<figcaption>Un notebook puede conectarse a multiples kernels</figcaption>
</figure>

# Magic commands

## Que son los magic commands?

Los magic commands son comandos especiales de IPython que comienzan con `%` (line magic) o `!!` (cell magic).

## Magic commands mas utiles

```
# Listar magic commands
```

```
# Medir tiempo de ejecucion
```

```
# Medir tiempo promedio
```

```
# Ejecutar codigo del sistema
!ls -la
!pwd
```

```
# Cargar archivo como codigo
```

```
# Escribir celda a archivo
print("Hola mundo")
```

```
# Graficos inline
```

```
# Recargar modulos automaticamente
%autoreload 2
```

# Aplicaciones practicas

## Integracion con bases de datos

Jupyter puede conectarse a multiples sistemas de bases de datos para analisis y visualizacion.

### SQLite

SQLite es ideal para proyectos pequenos y prototipos.

```
# Usar SQLite desde Jupyter
import sqlite3

# Crear conexion
conn = sqlite3.connect('datos.db')
cursor = conn.cursor()

# Crear tabla
cursor.execute('''
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY,
        nombre TEXT,
        edad INTEGER
    )
''')

# Insertar datos
cursor.execute("INSERT INTO usuarios VALUES (1, 'Ana', 30)")
conn.commit()
```

```
# Consultar datos
import pandas as pd

df = pd.read_sql_query("SELECT * FROM usuarios", conn)
df
```

### PostgreSQL

Para PostgreSQL se recomienda usar `psycopg2` o `sqlalchemy`.

```
# Conectar a PostgreSQL
pip install psycopg2-binary sqlalchemy
```

```
# Consultar PostgreSQL
from sqlalchemy import create_engine
import pandas as pd

engine = create_engine('postgresql://usuario:password@localhost:5432/midb')
df = pd.read_sql_query("SELECT * FROM ventas LIMIT 100", engine)
df.head()
```

### MySQL / MariaDB

```
# Conectar a MySQL
pip install pymysql sqlalchemy
```

```
# Consultar MySQL
from sqlalchemy import create_engine
import pandas as pd

engine = create_engine('mysql+pymysql://usuario:password@localhost:3306/midb')
df = pd.read_sql_query("SELECT * FROM clientes", engine)
df.head()
```

### MongoDB

```
# Conectar a MongoDB
pip install pymongo
```

```
# Consultar MongoDB
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['mi_base']
coleccion = db['documentos']

for doc in coleccion.find().limit(5):
    print(doc)
```

### Visualizacion de resultados

```
# Graficar resultados de SQL
import matplotlib.pyplot as plt

ventas_por_mes = pd.read_sql_query(
    "SELECT mes, SUM(total) FROM ventas GROUP BY mes",
    engine
)

plt.bar(ventas_por_mes['mes'], ventas_por_mes['SUM(total)'])
plt.title("Ventas por mes")
plt.show()
```

## Pruebas unitarias dentro de Jupyter

Jupyter permite ejecutar pruebas unitarias directamente en las celdas.

### Usar assert

```
# Pruebas simples con assert
def sumar(a, b):
    return a + b

assert sumar(2, 3) == 5
assert sumar(-1, 1) == 0
print("Todas las pruebas pasaron")
```

### Usar pytest

```
# Instalar pytest
pip install pytest
```

```
# Escribir pruebas con pytest
# En una celda de codigo
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

# Pruebas
assert factorial(0) == 1
assert factorial(5) == 120
```

### Usar ipytest

```
# Instalar ipytest
pip install ipytest
```

```
# Ejecutar pytest en una celda
import ipytest
ipytest.autoconfig()

%%ipytest

def test_suma():
    assert sumar(2, 3) == 5

def test_factorial():
    assert factorial(5) == 120
```

### Buenas practicas de testing

-   Escribe pruebas en celdas separadas o en archivos `.py`.

-   Usa nombres descriptivos para las funciones de prueba.

-   Verifica casos limite y errores esperados.

-   Ejecuta todas las celdas antes de entregar el cuaderno.

> **✅ Tip:**
> Para proyectos grandes, considera mover las pruebas a archivos `test_*.py` y ejecutarlos con pytest desde la terminal.

# Visualizacion interactiva

## Plotly

### Instalacion

```
# Instalar Plotly
pip install plotly
```

### Grafico basico

```
# Grafico de lineas con Plotly
import plotly.graph_objects as go
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

fig = go.Figure(data=go.Scatter(x=x, y=y, mode='lines', name='Seno'))
fig.update_layout(title='Grafico interactivo', xaxis_title='X', yaxis_title='Y')
fig.show()
```

### Grafico de barras interactivo

```
# Barras interactivas
import plotly.express as px

df = px.data.gapminder().query("year == 2007").nlargest(10, 'pop')
fig = px.bar(df, x='country', y='pop', color='continent', title='Poblacion por pais')
fig.show()
```

### Mapas con Plotly

```
# Mapa coropletico
fig = px.choropleth(df, locations='iso_alpha', color='lifeExp',
                    hover_name='country', color_continuous_scale='Viridis',
                    title='Expectativa de vida por pais')
fig.show()
```

## Bokeh

### Instalacion

```
# Instalar Bokeh
pip install bokeh
```

### Grafico basico

```
# Grafico con Bokeh
from bokeh.plotting import figure, show, output_notebook
import numpy as np

output_notebook()

x = np.linspace(0, 10, 100)
y = np.cos(x)

p = figure(title='Coseno interactivo', x_axis_label='x', y_axis_label='y')
p.line(x, y, line_width=2)
show(p)
```

### Herramientas interactivas

```
# Zoom y seleccion
from bokeh.plotting import figure, show, output_notebook
from bokeh.models import HoverTool

output_notebook()

p = figure(title='Scatter interactivo', tools='pan,box_zoom,reset,hover')
p.circle([1, 2, 3, 4, 5], [6, 7, 2, 4, 5], size=15)
show(p)
```

> **✅ Tip:**
> Usa Plotly cuando necesites graficos rapidos y atractivos. Usa Bokeh cuando requieras un control mas fino sobre la interactividad y las herramientas.

# Big Data y MLOps

## Manejo de grandes datasets con Dask

### Que es Dask?

Dask es una biblioteca de computacion paralela para Python que permite trabajar con datasets mas grandes que la memoria RAM disponible.

### Instalacion

```
# Instalar Dask
pip install dask[complete]
```

### Dask DataFrames

```
# Crear Dask DataFrame
import dask.dataframe as dd

ddf = dd.read_csv('archivos_*.csv')
print(ddf.head())
print(ddf.shape[0].compute())  # numero total de filas
```

### Operaciones paralelas

```
# Agregaciones con Dask
resultado = ddf.groupby('categoria').valor.sum().compute()
print(resultado)
```

### Dask Arrays

```
# Arrays grandes con Dask
import dask.array as da

x = da.random.random((10000, 10000), chunks=(1000, 1000))
print(x.mean().compute())
```

### Dask Delayed

```
# Computo lazy con delayed
from dask import delayed

@delayed
def sumar(x, y):
    return x + y

tareas = [sumar(i, i + 1) for i in range(10)]
total = delayed(sum)(tareas)
print(total.compute())
```

## Integracion con MLflow

### Que es MLflow?

MLflow es una plataforma de codigo abierto para gestionar el ciclo de vida de modelos de machine learning: experimentos, parametros, metricas y artefactos.

### Instalacion

```
# Instalar MLflow
pip install mlflow
```

### Tracking de experimentos

```
# Registrar un experimento
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

mlflow.set_experiment("mi_experimento")

with mlflow.start_run():
    X, y = load_iris(return_X_y=True)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    
    mlflow.log_param("n_estimators", 100)
    mlflow.log_metric("accuracy", accuracy)
    mlflow.sklearn.log_model(model, "modelo")
    
    print(f"Accuracy: {accuracy}")
```

### Interfaz web de MLflow

```
# Iniciar UI de MLflow
mlflow ui
```

Por defecto, MLflow UI se abre en <http://localhost:5000>.

### Guardar y cargar modelos

```
# Cargar modelo registrado
import mlflow.sklearn

modelo_uri = "runs:/<run_id>/modelo"
modelo = mlflow.sklearn.load_model(modelo_uri)
predicciones = modelo.predict(X_test)
```

> **💡 Nota:**
> MLflow permite reproducir experimentos, comparar metricas y compartir modelos con el equipo sin salir del ecosistema Jupyter.

# Gestion de kernels y entornos

## Crear un entorno virtual

```
# Con venv
python -m venv mi_entorno
source mi_entorno/bin/activate
pip install ipykernel
python -m ipykernel install --user --name mi_entorno
```

```
# Con conda
conda create -n mi_entorno python=3.11
conda activate mi_entorno
conda install ipykernel
python -m ipykernel install --user --name mi_entorno
```

## Seleccionar kernel en Jupyter

En Jupyter Notebook o Lab, ve a **Kernel \> Change kernel** y selecciona el entorno deseado.

## Detener y reiniciar kernels

```
# Gestion de kernels
# Desde el menu: Kernel > Restart Kernel
# Kernel > Interrupt Kernel
# Kernel > Shutdown Kernel
```

> **⚠️ Advertencia:**
> Reiniciar el kernel borra todas las variables y resultados en memoria. Guarda tu trabajo antes.

# Extensiones

## Extensiones de Jupyter Notebook

```
# Instalar jupyter_contrib_nbextensions
pip install jupyter_contrib_nbextensions
jupyter contrib nbextension install --user
```

Extensiones recomendadas:

-   **Table of Contents**: indice automatico.

-   **Hinterland**: autocompletado automatico.

-   **Snippets**: fragmentos de codigo reutilizables.

-   **ExecuteTime**: tiempo de ejecucion de celdas.

## Extensiones de JupyterLab

```
# Gestionar extensiones
jupyter labextension list
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

Extensiones recomendadas:

-   **\@jupyter-widgets/jupyterlab-manager**: soporte para widgets.

-   **jupyterlab-git**: integracion con Git.

-   **\@jupyterlab/toc**: tabla de contenidos.

# Widgets interactivos

## Instalacion

```
# Instalar ipywidgets
pip install ipywidgets
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

## Ejemplo basico

```
# Widget deslizador
import ipywidgets as widgets
from IPython.display import display

slider = widgets.IntSlider(value=50, min=0, max=100, step=1, description='Valor:')
display(slider)
```

```
# Widget de boton
button = widgets.Button(description="Click me!")
output = widgets.Output()

def on_button_clicked(b):
    with output:
        print("Boton presionado")

button.on_click(on_button_clicked)
display(button, output)
```

## Widgets avanzados

### Contenedores y layouts

```
# Organizar widgets en tabs
import ipywidgets as widgets
from IPython.display import display

tab1 = widgets.VBox([
    widgets.IntSlider(description="Valor 1"),
    widgets.IntSlider(description="Valor 2")
])

tab2 = widgets.VBox([
    widgets.Text(description="Nombre"),
    widgets.Text(description="Email")
])

tabs = widgets.Tab(children=[tab1, tab2])
tabs.set_title(0, "Numericos")
tabs.set_title(1, "Texto")
display(tabs)
```

### Widgets vinculados

```
# Vincular dos widgets
slider = widgets.IntSlider(description="Slider")
text = widgets.IntText(description="Texto")

widgets.link((slider, 'value'), (text, 'value'))
display(slider, text)
```

### Observe cambios

```
# Reaccionar a cambios
slider = widgets.IntSlider(description="Valor", min=0, max=100)
output = widgets.Output()

def on_change(change):
    with output:
        output.clear_output()
        print(f"Nuevo valor: {change['new']}")

slider.observe(on_change, names='value')
display(slider, output)
```

### Subir archivos

```
# Widget para subir archivos
uploader = widgets.FileUpload(accept='.csv', multiple=False)
display(uploader)

# Acceder al contenido
for nombre, info in uploader.value.items():
    contenido = info['content']
    print(f"Archivo: {nombre}, bytes: {len(contenido)}")
```

### Formularios interactivos

```
# Formulario con validacion
nombre = widgets.Text(description="Nombre:", placeholder="Tu nombre")
edad = widgets.IntText(description="Edad:", value=18)
enviar = widgets.Button(description="Enviar", button_style="success")
salida = widgets.Output()

def al_enviar(b):
    with salida:
        salida.clear_output()
        if nombre.value and edad.value > 0:
            print(f"Hola {nombre.value}, tienes {edad.value} anios")
        else:
            print("Completa todos los campos")

enviar.on_click(al_enviar)
display(nombre, edad, enviar, salida)
```

> **✅ Tip:**
> Combina widgets con funciones de callback para crear aplicaciones interactivas completas sin salir de Jupyter.

# Buenas practicas

## Organizacion del cuaderno

1.  Comienza con una celda de Markdown que explique el proposito.

2.  Divide el cuaderno en secciones con encabezados.

3.  Ordena las celdas de forma logica.

4.  Limpia salidas innecesarias antes de compartir.

5.  Guarda versiones con nombres descriptivos.

## Optimizacion

-   Usa `%timeit` para identificar cuellos de botella.

-   Evita celdas muy largas; divide la logica.

-   Reinicia el kernel y ejecuta todo para verificar reproducibilidad.

-   Usa funciones en lugar de codigo repetido.

## Compartir cuadernos

-   Exporta a PDF, HTML o Markdown.

-   Sube a GitHub con un `README.md`.

-   Usa NBViewer para compartir sin servidor.

-   Considera Binder para ejecutabilidad en la nube.

## Integracion con Git

Git es fundamental para versionar cuadernos de Jupyter. Aunque los archivos `.ipynb` contienen metadatos y salidas que dificultan las diferencias, existen herramientas para facilitar el trabajo.

### Configuracion basica

```
# Inicializar repositorio
git init
git add .
git commit -m "Primer cuaderno de Jupyter"
```

### Ignorar salidas con nbstripout

```
# Instalar nbstripout
pip install nbstripout
nbstripout --install
```

Esta herramienta limpia las salidas de los cuadernos antes de hacer commit, reduciendo el tamano del repositorio y facilitando las revisiones.

### Comparar cuadernos

```
# Configurar diff para notebooks
git config --local core.attributesfile .gitattributes
```

```
# Ejemplo de .gitattributes
*.ipynb filter=nbstripout
*.ipynb diff=ipynb
```

### Extension jupyterlab-git

```
# Instalar extension Git para JupyterLab
pip install jupyterlab-git
jupyter lab build
```

Con esta extension puedes hacer commit, ver diferencias y gestionar ramas directamente desde JupyterLab.

### Buenas practicas con Git

-   Limpia salidas antes de commitear.

-   Usa nombres descriptivos para los cuadernos.

-   Documenta dependencias en `requirements.txt` o `environment.yml`.

-   Incluye un `README.md` con instrucciones de ejecucion.

-   Etiqueta versiones importantes con `git tag`.

> **✅ Tip:**
> Combina `nbstripout` con `jupyterlab-git` para un flujo de trabajo profesional y ordenado.

# Exportacion y publicacion

## Exportar con nbconvert

```
# Instalar nbconvert
pip install nbconvert
```

```
# Exportar a HTML
jupyter nbconvert mi_cuaderno.ipynb --to html
```

```
# Exportar a PDF
jupyter nbconvert mi_cuaderno.ipynb --to pdf
```

```
# Exportar a Markdown
jupyter nbconvert mi_cuaderno.ipynb --to markdown
```

```
# Exportar a script de Python
jupyter nbconvert mi_cuaderno.ipynb --to script
```

## Publicar con Binder

Binder permite ejecutar cuadernos en la nube desde un repositorio de Git.

1.  Sube tu cuaderno a GitHub.

2.  Crea un archivo `requirements.txt` con las dependencias.

3.  Ve a <https://mybinder.org> y pega la URL del repositorio.

# JupyterHub

## Que es JupyterHub?

JupyterHub es una plataforma multiusuario que permite a multiples personas acceder a entornos de Jupyter desde un unico servidor. Es ideal para:

-   Aulas y cursos.

-   Equipos de ciencia de datos.

-   Organizaciones que comparten recursos computacionales.

## Instalacion basica

```
# Instalar JupyterHub
pip install jupyterhub
npm install -g configurable-http-proxy
```

```
# Instalar con conda
conda install -c conda-forge jupyterhub
```

## Iniciar JupyterHub

```
# Iniciar servidor JupyterHub
jupyterhub
```

Por defecto, JupyterHub escucha en el puerto 8000.

## Autenticacion

JupyterHub soporta multiples autenticadores:

-   **PAM**: autenticacion nativa del sistema Linux.

-   **OAuth**: Google, GitHub, GitLab.

-   **LDAP**: directorios empresariales.

-   **NativeAuthenticator**: base de datos local de usuarios.

```
# Configuracion basica de JupyterHub
# jupyterhub_config.py
c.JupyterHub.authenticator_class = 'jupyterhub.auth.PAMAuthenticator'
c.JupyterHub.bind_url = 'http://:8000'
c.Spawner.default_url = '/lab'
```

## Spawners

Un spawner crea el entorno de cada usuario. Los mas comunes son:

-   **LocalProcessSpawner**: procesos locales del sistema.

-   **DockerSpawner**: contenedores Docker por usuario.

-   **KubeSpawner**: pods de Kubernetes.

```
# Usar DockerSpawner
pip install dockerspawner
```

```
# Configurar DockerSpawner
c.JupyterHub.spawner_class = 'dockerspawner.DockerSpawner'
c.DockerSpawner.image = 'jupyter/base-notebook'
```

> **⚠️ Advertencia:**
> Configurar JupyterHub en produccion requiere conocimientos de administracion de sistemas, seguridad y redes.

# Voila

## Que es Voila?

Voila convierte cuadernos de Jupyter en aplicaciones web interactivas. A diferencia de JupyterLab, oculta el codigo y muestra solo los widgets y las salidas, creando dashboards limpios.

## Instalacion

```
# Instalar Voila
pip install voila
jupyter labextension install @voila-dashboards/jupyterlab-preview
```

## Usar Voila

```
# Ejecutar un cuaderno con Voila
voila mi_cuaderno.ipynb
```

Voila abre el cuaderno como una aplicacion web en el puerto 8866 por defecto.

## Opciones utiles

```
# Cambiar puerto
voila mi_cuaderno.ipynb --port 8080
```

```
# No abrir navegador
voila mi_cuaderno.ipynb --no-browser
```

```
# Mostrar solo widgets
voila mi_cuaderno.ipynb --strip_sources=True
```

## Crear un dashboard

Pasos para crear un dashboard con Voila:

1.  Diseña el cuaderno con widgets interactivos.

2.  Oculta o elimina celdas de codigo innecesarias.

3.  Ejecuta `voila mi_cuaderno.ipynb`.

4.  Comparte la URL generada.

```
# Ejemplo de dashboard
import ipywidgets as widgets
from IPython.display import display
import matplotlib.pyplot as plt
import numpy as np

slider = widgets.IntSlider(value=10, min=1, max=50, description='Frecuencia')

def update_plot(freq):
    x = np.linspace(0, 2*np.pi, 100)
    plt.figure(figsize=(8, 4))
    plt.plot(x, np.sin(freq * x))
    plt.show()

widgets.interact(update_plot, freq=slider)
```

> **✅ Tip:**
> Usa Voila cuando necesites compartir resultados con personas que no conocen Jupyter ni programacion.

# Jupyter avanzado

## Jupyter AI

### Que es Jupyter AI?

Jupyter AI es una extension oficial que integra modelos de inteligencia artificial directamente en JupyterLab y Jupyter Notebook. Permite:

-   Generar codigo desde descripciones en lenguaje natural.

-   Explicar codigo existente.

-   Responder preguntas tecnicas sin salir del entorno.

-   Usar multiples proveedores de IA.

### Instalacion

```
# Instalar Jupyter AI
pip install jupyter-ai
```

Para JupyterLab:

```
# Instalar extension de JupyterLab
pip install jupyter-ai jupyterlab
```

### Configurar proveedores

Jupyter AI soporta OpenAI, Anthropic, Google, Hugging Face y otros.

```
# Configurar API key
export OPENAI_API_KEY=tu_clave_aqui
export ANTHROPIC_API_KEY=tu_clave_aqui
```

### Uso basico

En JupyterLab aparece un panel de chat. Tambien puedes usar comandos magicos:

```
# Generar codigo con IA
Escribe una funcion en Python que calcule el factorial de un numero
```

```
# Explicar codigo
Explica el siguiente codigo:

def factorial(n):
    return 1 if n <= 1 else n * factorial(n - 1)
```

```
# Preguntar sin codigo
Como funciona la recursividad en Python?
```

> **✅ Tip:**
> Jupyter AI es util para prototipar rapido, pero revisa siempre el codigo generado antes de usarlo en produccion.

## Kernels remotos

### Que son los kernels remotos?

Un kernel remoto permite ejecutar codigo en una maquina diferente a la que muestra la interfaz de Jupyter. Es util cuando necesitas mas recursos computacionales o datos ubicados en otro servidor.

### Kernel remoto via SSH

```
# Instalar kernel en servidor remoto
# En el servidor remoto
python -m pip install ipykernel
python -m ipykernel install --user --name remoto --display-name "Python Remoto"
```

```
# Conectar con SSH tunnel
ssh -L 8888:localhost:8888 usuario@servidor-remoto
jupyter lab --no-browser
```

### Jupyter Kernel Gateway

```
# Instalar Kernel Gateway
pip install jupyter_kernel_gateway
```

```
# Iniciar Kernel Gateway
jupyter kernelgateway --KernelGatewayApp.ip=0.0.0.0 --KernelGatewayApp.port=9999
```

```
# Conectar notebook a kernel remoto
# Desde la interfaz de Jupyter:
# Kernel > Change kernel > Seleccionar kernel remoto
```

> **⚠️ Advertencia:**
> Nunca expongas un kernel remoto sin autenticacion. Usa siempre SSH tunnels, VPNs o firewalls para proteger el acceso.

## Despliegue en la nube

### Amazon Web Services (AWS)

#### EC2

```
# Pasos en AWS EC2
# 1. Crear una instancia EC2 (Ubuntu recomendado)
# 2. Configurar el security group para permitir el puerto 8888
# 3. Conectarte por SSH
# 4. Instalar Jupyter
sudo apt update
sudo apt install -y python3-pip
pip3 install jupyter jupyterlab

# 5. Configurar autenticacion
jupyter lab --generate-config
jupyter lab password

# 6. Iniciar Jupyter
jupyter lab --ip=0.0.0.0 --no-browser --allow-root
```

#### Amazon SageMaker

Amazon SageMaker proporciona instancias de notebook administradas con Jupyter preinstalado.

```
# Crear notebook en SageMaker
# 1. Ir a Amazon SageMaker Studio
# 2. Crear un nuevo Jupyter Notebook
# 3. Seleccionar instancia (ml.t3.medium, ml.m5.large, etc.)
# 4. Elegir kernel (Python 3, PyTorch, TensorFlow)
```

### Microsoft Azure

#### Maquina virtual

```
# Pasos en Azure VM
# 1. Crear una maquina virtual Ubuntu
# 2. Abrir el puerto 8888 en Network Security Group
# 3. Conectarte por SSH
# 4. Instalar Jupyter
sudo apt update && sudo apt install -y python3-pip
pip3 install jupyter jupyterlab

# 5. Configurar contrasena
jupyter lab --generate-config
jupyter lab password

# 6. Ejecutar
jupyter lab --ip=0.0.0.0 --no-browser
```

#### Azure Machine Learning

Azure ML ofrece cuadernos administrados integrados con el ecosistema de Azure.

```
# Usar Azure ML Notebooks
# 1. Crear un Workspace de Azure Machine Learning
# 2. Ir a Notebooks
# 3. Crear o subir un cuaderno .ipynb
# 4. Seleccionar compute target
```

### Google Cloud Platform (GCP)

#### Compute Engine

```
# Pasos en GCP Compute Engine
# 1. Crear una VM con Ubuntu
# 2. Abrir firewall para el puerto 8888
# 3. Conectarte por SSH
# 4. Instalar Jupyter
sudo apt update
sudo apt install -y python3-pip
pip3 install jupyter jupyterlab

# 5. Configurar acceso
jupyter lab --generate-config
jupyter lab password

# 6. Iniciar servidor
jupyter lab --ip=0.0.0.0 --no-browser
```

#### Vertex AI Workbench

Vertex AI Workbench ofrece instancias de notebook administradas con integracion a BigQuery y otros servicios de GCP.

```
# Usar Vertex AI Workbench
# 1. Ir a Vertex AI > Workbench
# 2. Crear una instancia de notebook
# 3. Seleccionar region y maquina
# 4. Abrir JupyterLab desde la consola
```

### Comparativa de opciones en la nube

  **Plataforma**   **Servicio**          **Mejor para**
  ---------------- --------------------- ------------------------------------
  AWS              EC2                   Control total del servidor
  AWS              SageMaker             ML administrado y escalable
  Azure            VM                    Flexibilidad de infraestructura
  Azure            Azure ML              Integracion con servicios de Azure
  GCP              Compute Engine        VMs personalizables
  GCP              Vertex AI Workbench   Cuadernos integrados con GCP


> **💡 Nota:**
> Las instancias en la nube generan costes por uso. Apaga las maquinas cuando no las necesites y configura alertas de presupuesto.

# Seguridad en Jupyter

## Autenticacion y contrasenas

Por defecto, Jupyter genera un token de autenticacion al iniciar. Para entornos compartidos o produccion, es recomendable configurar una contrasena.

```
# Configurar contrasena
jupyter lab --generate-config
jupyter lab password
```

```
# Iniciar con contrasena
jupyter lab --NotebookApp.token='' --NotebookApp.password='sha1:...'
```

## Certificados SSL

Para conexiones seguras, usa certificados SSL:

```
# Generar certificado autofirmado
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout mi_certificado.key -out mi_certificado.pem
```

```
# Iniciar Jupyter con SSL
jupyter lab --certfile=mi_certificado.pem --keyfile=mi_certificado.key
```

## Restriccion de acceso

```
# Escuchar solo localhost
jupyter lab --ip=127.0.0.1
```

```
# Deshabilitar ejecucion de shell
c.NotebookApp.disable_check_xsrf = False
c.NotebookApp.allow_remote_access = False
```

## Buenas practicas de seguridad

-   Nunca ejecutes Jupyter como root en produccion.

-   Usa contrasenas fuertes y tokens seguros.

-   Manten Jupyter y sus dependencias actualizadas.

-   Limita el acceso con firewalls y VPNs.

-   No compartas tokens ni credenciales en repositorios publicos.

-   Revisa las extensiones antes de instalarlas.

## Entornos aislados

Usa contenedores o entornos virtuales para aislar usuarios y proyectos.

```
# Ejecutar Jupyter en Docker
docker run -p 8888:8888 jupyter/scipy-notebook
```

> **⚠️ Advertencia:**
> Exponer Jupyter sin autenticacion ni SSL permite que cualquiera ejecute codigo en tu servidor. Configura siempre medidas de seguridad adecuadas.

# Personalizacion y extensiones propias

## Personalizacion de temas

### Temas de JupyterLab

JupyterLab incluye temas claro y oscuro por defecto.

```
# Cambiar tema
# Settings > JupyterLab Theme > JupyterLab Dark
```

### Instalar temas personalizados

```
# Tema oscuro personalizado
pip install jupyterlab_theme_solarized_dark
jupyter labextension install jupyterlab_theme_solarized_dark
```

```
# Activar tema instalado
# Settings > JupyterLab Theme > Solarized Dark
```

### Personalizar apariencia con CSS

```
# CSS personalizado
# Crear archivo: ~/.jupyter/custom/custom.css

/* Fondo de celda seleccionada */
.jp-Notebook .jp-Cell.jp-mod-active {
    border-left: 4px solid #0066cc;
}
```

## Creacion de extensiones propias

### Estructura de una extension

Una extension de JupyterLab es un paquete de Node.js con TypeScript.

```
# Instalar cookiecutter
pip install cookiecutter
cookiecutter https://github.com/jupyterlab/extension-cookiecutter-ts.git
```

### Extension simple: Hola mundo

```
# Estructura del proyecto
mi_extension/
  package.json
  src/
    index.ts
  tsconfig.json
  webpack.config.js
```

```
# src/index.ts basico
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'mi-extension:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('Mi extension esta activa');
  }
};

export default plugin;
```

### Instalar extension en desarrollo

```
# Instalar localmente
cd mi_extension
pip install -e .
jupyter labextension develop . --overwrite
jupyter lab build
```

### Publicar extension

```
# Publicar en npm
npm login
npm publish
```

```
# Instalar extension publicada
jupyter labextension install mi-extension
```

## Extensiones de Jupyter Notebook classic

```
# Estructura basica
mi_nbextension/
  main.js
  mi_nbextension.yaml
```

```
# main.js simple
define(function(require, exports, module) {
    console.log('Mi extension de Notebook cargada');
});
```

```
# Instalar extension de Notebook
jupyter nbextension install mi_nbextension
jupyter nbextension enable mi_nbextension/main
```

> **✅ Tip:**
> Para extensiones simples, considera primero scripts de IPython o widgets. Las extensiones de JupyterLab requieren conocimientos de TypeScript y Node.js.

# Integracion con LaTeX

## Ecuaciones en celdas Markdown

Jupyter utiliza MathJax para renderizar ecuaciones matematicas en celdas Markdown.

### Ecuaciones en linea

```
# Ecuacion en linea
La energia se expresa como $E = mc^2$.
```

### Ecuaciones en bloque

```
# Ecuacion en bloque
$$
\int_{a}^{b} f(x) \, dx = F(b) - F(a)
$$
```

### Matriz

```
# Matriz en LaTeX
$$
A = \begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}
$$
```

## Exportar cuadernos a LaTeX

```
# Exportar a LaTeX
jupyter nbconvert mi_cuaderno.ipynb --to latex
```

```
# Exportar a PDF via LaTeX
jupyter nbconvert mi_cuaderno.ipynb --to pdf
```

## Plantillas LaTeX personalizadas

```
# Usar plantilla personalizada
jupyter nbconvert mi_cuaderno.ipynb --to pdf --template mi_plantilla.tplx
```

```
# Ejemplo de plantilla basica
((*- extends 'article.tplx' -*))

((* block title *))
\title{Mi informe cientifico}
\author{Autor}
\date{\today}
\maketitle
((* endblock title *))
```

## Macros y simbolos frecuentes

  **Descripcion**   **LaTeX**          **Resultado**
  ----------------- ------------------ ------------------
  Fraccion          `\frac{a}{b}`      $\frac{a}{b}$
  Raiz cuadrada     `\sqrt{x}`         $\sqrt{x}$
  Suma              `\sum_{i=1}^{n}`   $\sum_{i=1}^{n}$
  Integral          `\int_{a}^{b}`     $\int_{a}^{b}$
  Griega alfa       `\alpha`           $\alpha$
  Griega beta       `\beta`            $\beta$


> **✅ Tip:**
> Usa LaTeX en Jupyter para documentacion cientifica, informes tecnicos y material educativo con notacion matematica profesional.

# Despliegue con Docker y Kubernetes

## Despliegue con Docker

### Imagenes oficiales

El proyecto Jupyter proporciona imagenes Docker listas para usar.

```
# Ejecutar Jupyter con Docker
docker run -p 8888:8888 jupyter/scipy-notebook
```

```
# Con volumen persistente
docker run -p 8888:8888 -v $(pwd):/home/jovyan/work jupyter/scipy-notebook
```

### Dockerfile personalizado

```
# Dockerfile para proyecto Jupyter
FROM jupyter/scipy-notebook:latest

USER root

COPY requirements.txt /tmp/
RUN pip install -r /tmp/requirements.txt

USER jovyan

COPY notebooks/ /home/jovyan/notebooks/
WORKDIR /home/jovyan/notebooks
```

```
# Construir y ejecutar
docker build -t mi-jupyter .
docker run -p 8888:8888 mi-jupyter
```

### docker-compose

```
# docker-compose.yml
version: '3.8'
services:
  jupyter:
    image: jupyter/scipy-notebook
    ports:
      - "8888:8888"
    volumes:
      - ./notebooks:/home/jovyan/work
    environment:
      - JUPYTER_ENABLE_LAB=yes
```

```
# Iniciar con docker-compose
docker-compose up
```

## Despliegue con Kubernetes

### Crear un deployment

```
# jupyter-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jupyter-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jupyter
  template:
    metadata:
      labels:
        app: jupyter
    spec:
      containers:
      - name: jupyter
        image: jupyter/scipy-notebook
        ports:
        - containerPort: 8888
```

```
# Aplicar deployment
kubectl apply -f jupyter-deployment.yaml
```

### Exponer el servicio

```
# jupyter-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: jupyter-service
spec:
  selector:
    app: jupyter
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8888
  type: LoadBalancer
```

```
# Aplicar servicio
kubectl apply -f jupyter-service.yaml
```

### Persistent Volume

```
# Reclamacion de volumen persistente
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jupyter-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

```
# Montar volumen en el deployment
spec:
  containers:
  - name: jupyter
    image: jupyter/scipy-notebook
    volumeMounts:
    - name: jupyter-storage
      mountPath: /home/jovyan/work
  volumes:
  - name: jupyter-storage
    persistentVolumeClaim:
      claimName: jupyter-pvc
```

### Helm chart

```
# Instalar JupyterHub con Helm
helm repo add jupyterhub https://hub.jupyter.org/helm-chart/
helm repo update

helm upgrade --install jupyterhub jupyterhub/jupyterhub \
  --namespace jupyterhub --create-namespace \
  --version=3.0.0 \
  --values config.yaml
```

> **⚠️ Advertencia:**
> Configurar Kubernetes en produccion requiere conocimientos de networking, almacenamiento persistente y seguridad. Practica primero en un cluster local como minikube.

# Solucion de problemas

## Jupyter no se encuentra

```
# Verificar instalacion
which jupyter
python -m jupyter --version
```

```
# Reinstalar
pip install --force-reinstall jupyter jupyterlab notebook
```

## Puerto ocupado

```
# Usar otro puerto
jupyter lab --port 8889
```

## Kernel muerto

1.  Reinicia el kernel: **Kernel \> Restart Kernel**.

2.  Verifica que el entorno tenga las dependencias instaladas.

3.  Revisa los mensajes de error en la terminal del servidor.

## Extensiones no funcionan

```
# Reconstruir JupyterLab
jupyter lab build
```

```
# Limpiar configuracion
jupyter lab clean
```

## Problemas con navegador

Si el navegador no abre automaticamente:

```
# Abrir manualmente
jupyter lab --no-browser
# Copia la URL que aparece en la terminal
```

# Ejercicios practicos

## Ejercicio 1: Crear un cuaderno

1.  Inicia JupyterLab.

2.  Crea un nuevo notebook de Python 3.

3.  Cambia el nombre a `mi_primer_cuaderno.ipynb`.

## Ejercicio 2: Texto y codigo

1.  Agrega una celda Markdown con un titulo y una breve descripcion.

2.  Agrega una celda de codigo que imprima `Hola, Jupyter!`.

3.  Ejecuta ambas celdas.

## Ejercicio 3: Graficos

```
# Grafico simple
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.title("Seno")
plt.show()
```

## Ejercicio 4: Magic commands

Prueba los siguientes comandos en celdas separadas:

```
# Practicar magic commands
!pwd
%lsmagic
```

## Ejercicio 5: Entornos

1.  Crea un entorno virtual.

2.  Instala ipykernel y registra el entorno.

3.  Abre Jupyter y cambia al nuevo kernel.

## Ejercicio 6: Widgets

Crea un widget deslizador que muestre el cuadrado del valor seleccionado.

```
# Widget interactivo
import ipywidgets as widgets

@widgets.interact(x=(0, 100))
def f(x):
    print(f"El cuadrado de {x} es {x**2}")
```

## Ejercicio 7: Exportar

Exporta tu cuaderno a HTML y PDF usando `jupyter nbconvert`.

## Ejercicio 8: Integracion con Git

1.  Inicializa un repositorio Git en la carpeta de tu cuaderno.

2.  Instala `nbstripout` para limpiar las salidas.

3.  Crea un archivo `.gitattributes` adecuado.

4.  Realiza varios commits y observa las diferencias.

## Ejercicio 9: Dashboard con Voila

1.  Crea un cuaderno con al menos dos widgets interactivos.

2.  Genera una grafica que responda a los widgets.

3.  Ejecuta el cuaderno con `voila`.

4.  Comparte la URL generada en tu red local.

## Ejercicio 10: JupyterHub local

1.  Instala JupyterHub en una maquina virtual o servidor local.

2.  Configura la autenticacion PAM o NativeAuthenticator.

3.  Crea al menos dos usuarios de prueba.

4.  Verifica que ambos usuarios puedan iniciar sesion y crear cuadernos.

## Ejercicio 11: Jupyter AI

1.  Instala Jupyter AI.

2.  Configura una API key de OpenAI o Anthropic.

3.  Usa `%%ai` para generar una funcion de Python.

4.  Pide a la IA que explique un fragmento de codigo.

## Ejercicio 12: Kernel remoto

1.  Configura un servidor remoto con Python e ipykernel.

2.  Crea un tunel SSH hacia el servidor.

3.  Conecta tu Jupyter local al kernel remoto.

4.  Ejecuta codigo y verifica que corre en el servidor remoto.

## Ejercicio 13: Despliegue en la nube

1.  Elige una plataforma: AWS, Azure o GCP.

2.  Crea una maquina virtual minima.

3.  Instala Jupyter y configura una contrasena.

4.  Accede al cuaderno desde tu navegador local.

5.  Apaga la instancia al finalizar para evitar costes.

## Ejercicio 14: Widgets avanzados

1.  Crea una interfaz con tabs que contenga multiples widgets.

2.  Vincula un slider con un campo de texto.

3.  Agrega un boton que muestre el resultado de una operacion.

## Ejercicio 15: Base de datos

1.  Crea una base de datos SQLite con al menos dos tablas.

2.  Inserta datos de prueba.

3.  Realiza consultas con pandas.

4.  Visualiza los resultados con matplotlib.

## Ejercicio 16: Pruebas unitarias

1.  Escribe tres funciones en celdas de codigo.

2.  Crea pruebas con `assert`.

3.  Instala `ipytest` y ejecuta las pruebas en una celda.

4.  Verifica que todas las pruebas pasan.

## Ejercicio 17: Visualizacion interactiva

1.  Instala Plotly y crea un grafico de dispersion interactivo.

2.  Agrega tooltips y zoom.

3.  Repite el ejercicio con Bokeh.

4.  Compara la sintaxis y funcionalidad de ambas bibliotecas.

## Ejercicio 18: Dask

1.  Crea un dataset CSV grande o descarga uno publico.

2.  Carga el dataset con Dask DataFrame.

3.  Realiza una agregacion y comparala con pandas.

4.  Mide el tiempo de ejecucion.

## Ejercicio 19: MLflow

1.  Instala MLflow.

2.  Entrena un modelo simple de scikit-learn.

3.  Registra parametros, metricas y el modelo con MLflow.

4.  Abre la interfaz web y revisa el experimento.

## Ejercicio 20: Seguridad

1.  Configura una contrasena para Jupyter.

2.  Genera un certificado SSL autofirmado.

3.  Inicia Jupyter con HTTPS y verifica la conexion.

4.  Revisa la configuracion de seguridad recomendada.

## Ejercicio 21: Temas personalizados

1.  Cambia entre el tema claro y oscuro de JupyterLab.

2.  Instala un tema de terceros.

3.  Crea un archivo `custom.css` con cambios menores.

4.  Reinicia Jupyter y verifica los cambios visuales.

## Ejercicio 22: Extension propia

1.  Usa cookiecutter para generar la estructura de una extension.

2.  Modifica el mensaje de activacion.

3.  Instala la extension en modo desarrollo.

4.  Verifica en la consola del navegador que se cargo.

## Ejercicio 23: LaTeX en Jupyter

1.  Crea una celda Markdown con una ecuacion en linea.

2.  Crea una celda con una ecuacion en bloque.

3.  Escribe una matriz usando sintaxis LaTeX.

4.  Exporta el cuaderno a PDF.

## Ejercicio 24: Docker

1.  Crea un Dockerfile basado en 'jupyter/scipy-notebook'.

2.  Agrega tus librerias favoritas en 'requirements.txt'.

3.  Construye la imagen y ejecuta un contenedor.

4.  Accede a Jupyter desde el navegador.

> **✅ Tip:**
> Realiza los ejercicios en orden. Los ultimos tres requieren conocimientos previos de Git, widgets y administracion de sistemas.

# Plantillas de cuadernos

## Plantilla de analisis de datos

Estructura recomendada:

```
# Plantilla de analisis
# 1. Importar librerias
import pandas as pd
import matplotlib.pyplot as plt

# 2. Cargar datos
df = pd.read_csv('datos.csv')

# 3. Exploracion
df.head()
df.describe()

# 4. Visualizacion
plt.figure(figsize=(10, 6))
plt.show()

# 5. Conclusiones
```

## Plantilla de machine learning

```
# Plantilla de ML
# 1. Cargar datos
# 2. Preprocesamiento
# 3. Division train/test
# 4. Entrenamiento
# 5. Evaluacion
# 6. Guardar modelo
```

## Plantilla de informe

```
# Plantilla de informe
# Titulo del informe

## Resumen ejecutivo

## Metodologia

## Resultados

## Conclusiones
```

# Glosario de terminos

Unidad basica de un cuaderno de Jupyter.

Comando magico que afecta toda una celda (comienza con `!!`).

Gestor de paquetes y entornos para Python y otros lenguajes.

Documento interactivo de Jupyter con codigo, texto y salidas.

Espacio aislado con su propia instalacion de paquetes.

Shell interactivo mejorado para Python.

Plataforma multiusuario para Jupyter.

IDE web moderno del proyecto Jupyter.

Interfaz clasica de cuadernos de Jupyter.

Proceso que ejecuta el codigo de un cuaderno.

Comando magico que afecta una sola linea (comienza con `%`).

Lenguaje de marcado ligero para formatear texto.

Herramienta para convertir cuadernos a otros formatos.

Servicio para visualizar cuadernos de forma estatica.

Gestor de paquetes de Python.

Capacidad de obtener los mismos resultados al ejecutar el codigo.

Kernel que se ejecuta en una maquina diferente a la interfaz de Jupyter.

Large Language Model, modelo de lenguaje grande usado por Jupyter AI.

Componente de JupyterHub que crea el entorno de cada usuario.

Plataforma de machine learning de Google Cloud.

Herramienta para convertir cuadernos en aplicaciones web.

Elemento interactivo en un cuaderno.

Extension para ejecutar pytest dentro de Jupyter.

Biblioteca de computacion paralela para grandes datasets.

Plataforma para gestionar el ciclo de vida de modelos de ML.

Biblioteca de graficos interactivos.

Biblioteca para visualizaciones interactivas en navegador.

Protocolo de seguridad para conexiones cifradas.

Codigo temporal de autenticacion de Jupyter.

Gestor de paquetes para Kubernetes.

Solicitud de almacenamiento persistente en Kubernetes.


# Recursos adicionales

## Documentacion oficial

-   **Jupyter:** <https://jupyter.org>

-   **JupyterLab:** <https://jupyterlab.readthedocs.io>

-   **Jupyter Notebook:** <https://jupyter-notebook.readthedocs.io>

-   **IPython:** <https://ipython.readthedocs.io>

## Comunidad

-   **Discourse:** <https://discourse.jupyter.org>

-   **GitHub:** <https://github.com/jupyter>

-   **Stack Overflow:** etiqueta `jupyter`

## Herramientas complementarias

Distribucion de Python con Jupyter incluido.

Plataforma para ejecutar cuadernos en la nube.

Cuadernos de Google basados en Jupyter.

Control de versiones para cuadernos.

Plataforma de competiciones con notebooks.

Convierte cuadernos en aplicaciones web.


## Tutoriales recomendados

1.  Configura JupyterLab con tu entorno favorito.

2.  Crea un cuaderno de analisis exploratorio de datos.

3.  Instala y prueba tres extensiones de JupyterLab.

4.  Publica un cuaderno en GitHub y visualizalo con NBViewer.

5.  Crea un dashboard interactivo con ipywidgets.

> **✅ Tip:**
> El ecosistema Jupyter evoluciona constantemente. Revisa la documentacion oficial para conocer las ultimas caracteristicas.

# Referencia rapida

## Comandos imprescindibles

```
# Hoja de ruta
jupyter --version              # versiones instaladas
jupyter notebook               # iniciar Notebook
jupyter lab                    # iniciar Lab
jupyter lab --no-browser       # sin abrir navegador
jupyter lab --port 9999        # puerto personalizado
jupyter kernelspec list        # listar kernels
jupyter nbconvert file.ipynb --to html   # exportar a HTML
jupyter nbconvert file.ipynb --to pdf    # exportar a PDF
voila file.ipynb                         # ejecutar como dashboard
jupyterhub                               # iniciar JupyterHub
```
