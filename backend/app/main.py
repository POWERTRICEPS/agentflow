from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskRequest(BaseModel):
    task: str


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/tasks/run")
def run_task(request: TaskRequest):
    return {
        "task": request.task,
        "plan": [
            "Inspect the relevant parts of the codebase",
            "Decide what files need to change",
            "Implement the requested change",
            "Run validation steps",
        ],
        "status": "success",
    }