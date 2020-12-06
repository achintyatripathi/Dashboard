import pandas as pd

df = pd.read_excel("data.xlsx")
df.columns = ['Sr_No','FIR_No','IPC','Date_of_offence','Date_of_FIR','Police_station','Day','Time_of_offence','First_vehicle','Fatalities','Serious','Minor','Second_vehicle','Fatalities_1','Serious_1','Minor_1','Type_of_collision','Hit_and_run','Intersection_mid_block','Maneuver_type','Place_of_occurence','Total_Fatalities','Total_serious','Total_minor','Latitude','Longitude','Road_name','Road_number','Rural_urban']
print(df['Date_of_offence'].isnull().sum().sum())
df['Date_of_offence']=pd.to_datetime(df['Date_of_offence'],format='%m-%d-%Y').dt.strftime('%m/%d/%Y')
print(df['Date_of_offence'])
df['geo']= df["Latitude"].astype(str) +","+ df["Longitude"].astype(str)
print(df['geo'].value_counts())

print(df['Longitude'].isnull().sum().sum());
#df.to_csv("data.csv")
