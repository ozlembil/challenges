import argparse
from collections import Counter

def rec_new_services(userid, text):
	'''
	INPUT: User ID (as a string) of the user we would like to recommend new 
	services to, and list of strings containing users, the users they follow on 
	Twitter, and the services the user uses
	OUTPUT: A list of the services used by the users the user follows
	'''
	#Converts each string in the text list to a nested list split on the colons
	user_list = [item.split(':') for item in text]

	#Returns the index of the sublist that contains the userid
	#If the userid doesn't exist in the list, returns -1
	user_index = next((i for i, sublist in enumerate(user_list) if userid in sublist), -1)

	if user_index == -1:
		return 'User not found'
		
	user_sublist = user_list[user_index]
	user_follows = user_sublist[2]
	user_follows = user_follows.split(',')

	#Build dictionary of services used by each user
	service_dict = {}
	for item in user_list:
		service_dict[item[1]] = item[3].strip().split(',')
	
	#Creating list of services
	services = []
	for user in user_follows:
		if user in service_dict:
			services.append(service_dict[user])
		else:
			continue
	
	#Flattening list
	services = [service for service_list in services for service in service_list]
	#I'm reaching semantic satiation with the word 'service'

	#Create a counter dictionary of the services 
	services_counter = Counter(services)

	#Convert the dictionary into a list 
	counter_list = [[value, key] for key, value in Counter(services).iteritems()]

	#Sort by the popularity, then alphabetically
	counter_list = sorted(counter_list, key=lambda item: (-item[0], item[1].upper()))

	#Extract only the service names
	services = [service[1] for service in counter_list]
	
	#Remove empty elements
	services = filter(None, services)
	
	#Return the first 4 recommended services if there are more than 4
	if len(services) > 4:
		return services[:4]
	else:
		return services

def main():
	'''
	This function parses the positional argument in the command line, 
	specifically the user id we would like to recommend new services for, 
	then calls the rec_new_services function.
	'''
	parser = argparse.ArgumentParser()
	parser.add_argument('user', help='Input userid you want to recommend new services for')
	args = parser.parse_args()
	userid = args.user

	f = open('social_connections.txt', 'r')
	text = f.readlines()

	return rec_new_services(userid=userid, text=text)


if __name__=='__main__':
	print main()
