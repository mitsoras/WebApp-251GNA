from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware  # Import CORSMiddleware
import pandas as pd
import os
import logging
from config import Config
from request_logger import RequestLoggerMiddleware, log_requests  # Import the logging middleware



DATA_DIR = Config.DATA_DIR
FRONTEND_ORIGIN = Config.FRONTEND_ORIGIN

app = FastAPI()

# Attach request logging middleware
app.add_middleware(RequestLoggerMiddleware)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")



# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Request body model
class PaymentRequest(BaseModel):
    vat: str
    sapNumber: str
    year: int
    entalma: Optional[str] = None  # Optional field for 'Αρ. Εντάλματος'

# Function to normalize 'Αρ. Εντάλματος'
def normalize_entalma(entalma: str) -> Optional[str]:
   
    if not entalma:
        return None
    numeric_part = entalma.replace("ΧΕΠ", "").strip()
    padded_value = numeric_part.zfill(7)  # Ensure it's 7 digits
    return f"ΧΕΠ      {padded_value}"  # Prepend 'ΧΕΠ      ' with 6 spaces


@app.post("/search_payments/")
async def search_payments(request: PaymentRequest):
    try:

         # Log received data
        logging.info(f"Received data: VAT={request.vat}, sapNumber={request.sapNumber}, Year={request.year}")
       
        # Ensure VAT is 9 digits with leading zeros if needed
        full_vat = request.vat.zfill(9)
        short_vat = full_vat.lstrip("0")  # Remove leading zeros for the 8-digit variant

        sapNumber = request.sapNumber
        year = request.year
        entalma = request.entalma

         # Determine the file path based on the year
        file_path = os.path.join(DATA_DIR, f"{year}.csv")
        
        # Check if the file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found for the selected year.")
        
        # Load the CSV, specifying the delimiter and skipping extra rows if needed
        df = pd.read_csv(file_path, skiprows=6, delimiter=';', on_bad_lines='skip', dtype={"Α.Φ.Μ": str, "Κωδ.Προμηθευτή": str, "Δικαιούχος Πληρ.": str })

        df.columns = df.columns.str.strip()  # Strip spaces from all column names
        
        # Normalize 'Αρ. Εντάλματος' if provided
        entalma_normalized = normalize_entalma(entalma) if entalma else None

        # Filter the DataFrame based on VAT and sapNumber
        filtered_df = df[
            ((df["Α.Φ.Μ"] == full_vat) | (df["Α.Φ.Μ"] == short_vat)) &
            (df["Κωδ.Προμηθευτή"] == sapNumber)
        ]

         # If 'Αρ. Εντάλματος' is provided, apply additional filtering
        if entalma_normalized and "Αρ. Εντάλματος" in df.columns:
            filtered_df = filtered_df[filtered_df["Αρ. Εντάλματος"] == entalma_normalized]

        # Check if there are any matching records
        if filtered_df.empty:
            if entalma and entalma_normalized:
                # If entalma was provided but no matches found
                return {"status": "partial_match", "message": "No payments found for the provided entalma."}
            else:
                # General case of no matches
                return {"status": "not_found", "message": "No payments found for the given VAT and sapNumber combination."}

         # Specify columns to return
        columns_to_return = [
            "Φορέας", "Έτος", "Αρ. Εντάλματος", "Κωδ.Προμηθευτή", "Α.Φ.Μ",
            "Ημ.Εξόφλησ", "Δικαιούχος Πληρ.", "Αρ. Παραστατικού", "Ημ/νία Παραστ/κού",
            "Συνολική Αξία", "ΦΟΡΟΣ (4%)", "ΦΟΡΟΣ (8%)", "ΦΟΡΟΣ (3%)", "ΦΟΡΟΣ (20%",
            "Σύνολο Κρατήσεων", "Πληρωτέα Αξία"
        ]
        filtered_df = filtered_df[columns_to_return].fillna("")

        result_data = filtered_df.to_dict(orient="records")
        

        logging.info(f"Data being returned: {len(result_data)} records")
        return {"status": "success", "data": result_data}
    
    except pd.errors.EmptyDataError:
        logging.error("The CSV file is empty or improperly formatted.")
        raise HTTPException(status_code=400, detail="The CSV file is empty or improperly formatted.")
    except KeyError as e:
        logging.error(f"Missing required column in the CSV: {e}")
        raise HTTPException(status_code=400, detail=f"Missing required column in the CSV: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")