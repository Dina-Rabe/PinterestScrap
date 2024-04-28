import urllib.request
import os
import logging
import csv
import tkinter as tk
from tkinter import filedialog, messagebox
from pathlib import Path
import argparse

class Logging:
    _instance = None

    @classmethod
    def get_instance(cls):
        if not cls._instance:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        if Logging._instance:
            raise ValueError("Singleton instance already exists. Use Logging.get_instance() to retrieve it.")
        
        # Configure the logger
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.DEBUG)

        # Create file handlers for different log levels
        info_handler = logging.FileHandler('info.log')
        info_handler.setLevel(logging.INFO)
        error_handler = logging.FileHandler('error.log')
        error_handler.setLevel(logging.ERROR)

        # Create log formatters
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        info_handler.setFormatter(formatter)
        error_handler.setFormatter(formatter)

        # Add handlers to the logger
        self.logger.addHandler(info_handler)
        self.logger.addHandler(error_handler)

    def log_info(self, message):
        self.logger.info(message)

    def log_error(self, message):
        self.logger.error(message)

class PinterestImage:
    def __init__(self, url_image, url_product=None, image_name=None):
        self.url_image = url_image
        self.url_product = url_product
        self.image_name = image_name
        self.log = Logging.get_instance()

    def download_image(self, destination_path):
        try:
            # Extract the image filename from the URL
            image_filename = self.url_image.split('/')[-1]

            # Use custom image name if provided, otherwise use the default image filename
            if self.image_name:
                image_filename = self.image_name

            # Construct the full path for the destination file
            destination_file = os.path.join(destination_path, image_filename)

            # Create the destination path if it doesn't exist
            os.makedirs(destination_path, exist_ok=True)

            # Download the image
            urllib.request.urlretrieve(self.url_image, destination_file)
            self.log.log_info(f"Image {image_filename} successfully downloaded to {destination_file}")
            return True
        except Exception as e:
            self.log.log_error(str(e))
            return False

class AppController:
    def __init__(self, file_name, destination_path=None):
        self.file_name = file_name
        self.destination_path = os.path.join(destination_path, os.path.splitext(os.path.basename(file_name))[0]) #Fetch the file name only without extension 
        self.log = Logging.get_instance()
        
    def isFileValid(self):
        try:
            with open(self.file_name, 'r') as file:
                # Check file extension
                if not self.file_name.lower().endswith('.csv'):
                    self.log.log_error(f"ERROR, {self.file_name} is not a CSV file")
                    return False

                # Read CSV file
                csv_reader = csv.reader(file)
                header = next(csv_reader)  # Get the header
                column_count = len(header)

                # Validate CSV format and column count
                if column_count != 2:
                    self.log.log_error(f"ERROR column count greater than 2!")
                    return False

                # for index, row in enumerate(csv_reader):
                #     if len(row) != column_count:
                #         self.log.log_error(f"ERROR at {index} line of file {self.file_name}, download aborted!")
                #         return False

            return True

        except Exception as e:
            self.log.log_error(f"Error occurred while validating the file: {str(e)}")
            return False

    def process(self):
        pinterest_images = []

        try:
            with open(self.file_name, 'r') as file:
                csv_reader = csv.reader(file)
                next(csv_reader)  # Skip the header

                for index, row in enumerate(csv_reader):
                    url_image = row[0]
                    url_product = row[1]
                    image_name = f"{index}.jpg"

                    pinterest_image = PinterestImage(url_image, url_product, image_name)
                    if pinterest_image.download_image(self.destination_path):
                        pinterest_images.append(pinterest_image)

        except Exception as e:
            self.log.log_error(f"Error occurred while processing the file: {str(e)}")

        return pinterest_images

class CustomButton(tk.Button):
    def __init__(self, master=None, **kwargs):
        # Button styles
        self.button_bg = "#D3A550"
        self.button_hover_bg = "#D01110"
        self.button_border = 0
        self.button_radius = "10%"
        self.button_shadow = "#EBE7D0"
        self.button_text_color = "#EBE7D0"

        # Call the parent class constructor
        super().__init__(master, **kwargs)

        # Configure the button appearance
        self.configure(bg=self.button_bg, fg=self.button_text_color,
                       bd=self.button_border, relief=tk.FLAT, highlightthickness=0,
                       activebackground=self.button_hover_bg, activeforeground=self.button_text_color)
        self.configure(borderwidth=0, highlightthickness=0, highlightcolor=self.button_shadow,
                       relief=tk.FLAT, padx=10, pady=5, highlightbackground=self.button_shadow)

        # Bind hover events
        self.bind("<Enter>", self.on_button_hover)
        self.bind("<Leave>", self.on_button_leave)

    def on_button_hover(self, event):
        self.config(bg=self.button_hover_bg, relief=tk.FLAT)

    def on_button_leave(self, event):
        self.config(bg=self.button_bg, relief=tk.FLAT)

class InfoStatusLabel(tk.Label):
    def __init__(self, master=None, **kwargs):
        # Label styles
        self.text_size = 10
        self.text_color = "#D01110"
        self.text_width = "bold"
        self.wrap_length = 150

        # Call the parent class constructor
        super().__init__(master, **kwargs)

        # Configure the label appearance
        self.configure(font=(None, self.text_size, self.text_width), fg=self.text_color, wraplength= self.wrap_length)


class FileDownloader:
    def __init__(self, root, destination_folder, list_files):
        self.root = root
        self.root.configure(bg="#121110")
        self.root.geometry("1024x512")
        self.file_names = list_files
        self.folder_destination = destination_folder

        self.root.title("Downloader")

        # self.list_files_frame = tk.Frame(self.root)
        # self.list_files_frame.pack(padx=5, pady=5)

        self.file_listbox = tk.Listbox(self.root, selectmode=tk.MULTIPLE, width=100, bg="#EBE7D0", fg="#121110")
        # self.file_listbox.pack(pady=5, padx=5, side=tk.LEFT)
        self.file_listbox.grid(column=0, row=0, pady=5, padx=5)

        self.browse_files_button = CustomButton(self.root, text="Browse Files", command=self.browse_files)
        # self.browse_files_button.pack(pady=5, padx=5, side=tk.LEFT)
        self.browse_files_button.grid(column=1, row=0, pady=5, padx=5)

        # self.folder_frame = tk.Frame(self.root)
        # self.folder_frame.pack(pady=5, padx=5)

        self.folder_entry = tk.Entry(self.root, width=100, bg="#EBE7D0", fg="#121110")
        # self.folder_entry.pack(side=tk.LEFT, padx=5, pady=5)
        self.folder_entry.grid(column=0, row=1, pady=5, padx=5)

        self.browse_folder_button = CustomButton(self.root, text="Select Destination", command=self.browse_folder)
        # self.browse_folder_button.pack(pady=5, padx=5)
        self.browse_folder_button.grid(column=1, row=1, pady=5, padx=5)

        self.button_frame = tk.Frame(self.root, bg="#121110")
        self.button_frame.grid(column=0, row=2, padx=5, pady=5)

        self.upload_button = CustomButton(self.button_frame, text="Download all files", command=self.download_files)
        self.upload_button.pack(pady=5, padx=5, side=tk.LEFT)
        # self.upload_button.grid(column=0, row=2, pady=5, padx=5)

        self.stop_button = CustomButton(self.button_frame, text="STOP", command=None)
        self.stop_button.pack(padx=5, pady=5, side=tk.LEFT)
        # self.stop_button.grid(column=1, row=2, pady=5, padx=5)


    def browse_files(self):
        home_directory = str(Path.home())
        file_paths = filedialog.askopenfilenames(initialdir=home_directory, filetypes=[("CSV files", "*.csv")])
        self.file_names = list(file_paths)
        self.update_file_listbox()

    def browse_folder(self):
        home_directory = str(Path.home())
        folder_path = filedialog.askdirectory(initialdir=home_directory)
        self.folder_destination = folder_path
        self.folder_entry.delete(0, tk.END)
        self.folder_entry.insert(tk.END, self.folder_destination)

    def download_files(self):
        if len(self.file_names) > 0 and self.folder_destination != "":
            status_info = tk.Frame(self.root, bg="#121110")
            status_info.grid(column=1, row=3, padx=5, pady=5)
            for index, file_name in enumerate(self.file_names):
                app_controller = AppController(file_name, self.folder_destination)
                if app_controller.isFileValid():
                    self.file_listbox.delete(index)
                    status_info_label = InfoStatusLabel(status_info, text=f"Processing {file_name}")
                    status_info_label.pack(pady=5)
                    app_controller.process()
                    
                else:
                    messagebox.showerror("ERROR", f"File {file_name} is not valid!")
        else:
            messagebox.showerror("ERROR", "No file selected OR destination folder not set!")

    def update_file_listbox(self):
        self.file_listbox.delete(0, tk.END)
        for file_name in self.file_names:
            self.file_listbox.insert(tk.END, file_name)

class FileDownloaderCLI:
    def __init__(self, destination_folder, list_files):
        self.destination_folder = destination_folder
        self.list_files = list_files

    def download_files(self):
        log = Logging.get_instance()
        if len(self.list_files) > 0 and self.destination_folder != "":
            log.log_info(f"DOWNLOAD START!")
        
            for file_name in self.list_files:
                app_controller = AppController(file_name, self.destination_folder)
                if app_controller.isFileValid():
                    app_controller.process()
                    
                else:
                    log.log_error("ERROR: " + f"File {file_name} is not valid!")
        else:
            log.log_error("ERROR: " + "No file selected OR destination folder not set!")



def main():
    log = Logging.get_instance()

    # Create the argument parser
    parser = argparse.ArgumentParser(description="Files downloader")
    parser.add_argument("-g", "--gui", metavar="FILE", nargs="+", help="Launch the app in gui mode")
    parser.add_argument("-d", "--destination", metavar="FOLDER", help="Destination folder for file processed")
    parser.add_argument("-c", "--cli", metavar="FILE", nargs="+", help="Launch the app in cli mode")
    
    # Parse the command-line arguments
    args = parser.parse_args()

    destination_folder = ""
    list_files = []
    if args.destination:
        destination_folder = args.destination
        log.log_info(f"Destination folder giving: {destination_folder}")
    
    if args.cli:
        list_files = args.cli
        log.log_info(f"CLI MODE START!")
        files_downloader = FileDownloaderCLI(destination_folder, list_files)
        files_downloader.download_files()
        
    if args.gui:
        list_files = args.gui
        log.log_info(f"GUI MODE START!")
        root = tk.Tk()
        files_downloader = FileDownloader(root, destination_folder, list_files)
        root.mainloop()

    



if __name__ == "__main__":
    main()
    