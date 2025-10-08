import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// Raw list data
const RAW_LIST = `Appraised Person	Head Of Department 	DEPARTMENT	Job Title
Koylass, Naseem	knurse@costaatt.edu.tt	Academic Affairs	Vice President Academic Affairs
Charles, Jason	cjack@costaatt.edu.tt	Career Management Service	Placement Officer
Alexander, Mitzy	cjack@costaatt.edu.tt	Communication Studies	Administrative Assistant
Batchasingh, Roddy	cjack@costaatt.edu.tt	Communication Studies	Senior Lecturer
Edwards Knox, Sophia	cjack@costaatt.edu.tt	Communication Studies	Chair, Communication Studies
Gouveia Ferguson, Julie	cjack@costaatt.edu.tt	Communication Studies	Senior Lecturer
James, Kayode	cjack@costaatt.edu.tt	Communication Studies	Senior Lecturer
Joefield-Lovell, Sharleen	cjack@costaatt.edu.tt	Communication Studies	Senior Lecturer
Kokaram, John-Jason	cjack@costaatt.edu.tt	Communication Studies	Senior Lecturer
Mitchell, Michelle	cjack@costaatt.edu.tt	Communication Studies	Senior Lecturer
Derby, Jodette	pfarrell@costaatt.edu.tt	Compass Center	Clerical Assistant
Farrell, Permilla	pfarrell@costaatt.edu.tt	Compass Center	Director, Compass Centre
Warner, Adana	pfarrell@costaatt.edu.tt	Compass Center	Developmental Advisor
King, Keron	kpwilliams@costaatt.edu.tt	Criminal Justice and Legal Studies	Senior Lecturer
Lovelace, Ria	kpwilliams@costaatt.edu.tt	Criminal Justice and Legal Studies	Administrative Assistant
Peters, Kevin	kpwilliams@costaatt.edu.tt	Criminal Justice and Legal Studies	Senior Lecturer
Pyle-Williams, Kirwin	kpwilliams@costaatt.edu.tt	Criminal Justice and Legal Studies	Chair, Criminal Justice and Legal Studies
David, Kester	lgbrown@costaatt.edu.tt	Educational Technologies and Distance Education	Educational Technologies Services Assistant
Gransaull-Brown, Liesel	lgbrown@costaatt.edu.tt	Educational Technologies and Distance Education	Director Education Technologies
Camps, Erin	rgalvarez@costaatt.edu.tt	Enrollment Management	Admissions Counsellor
Franco, Natalie	rgalvarez@costaatt.edu.tt	Enrollment Management	Admissions Counsellor
Gilkes-Alvarez, Reynela	rgalvarez@costaatt.edu.tt	Enrollment Management	Senior Admissions Counsellor
Kennedy, Kevon	rgalvarez@costaatt.edu.tt	Enrollment Management	Clerical Assistant
Miller, Tanasha	rgalvarez@costaatt.edu.tt	Enrollment Management	Clerical Assistant
Mohammed, Aaron	rgalvarez@costaatt.edu.tt	Enrollment Management	Admissions Counsellor
Morris, Cindy	rgalvarez@costaatt.edu.tt	Enrollment Management	Administrative Assistant
Pollard, Marvin	rgalvarez@costaatt.edu.tt	Enrollment Management	Admissions Counsellor 
Prevatt, Liselle	rgalvarez@costaatt.edu.tt	Enrollment Management	Admissions Counsellor I
Villafana, Abigail	rgalvarez@costaatt.edu.tt	Enrollment Management	Admissions Assistant I
Charles-Harris, Abeni	kpaul@costaatt.edu.tt	Environmental Studies	Senior Lecturer
Elliot, Venessa	kpaul@costaatt.edu.tt	Environmental Studies	Senior Lecturer
Hypolite, Michelle	kpaul@costaatt.edu.tt	Environmental Studies	Senior Lecturer
Laltoo, Sochan	kpaul@costaatt.edu.tt	Environmental Studies	Senior Lecturer
Long, Cheryl-Ann	kpaul@costaatt.edu.tt	Environmental Studies	Administrative Assistant
Paul, Karen	kpaul@costaatt.edu.tt	Environmental Studies	Chair (Ag) Environmental Studies
Virgil, Christian	kpaul@costaatt.edu.tt	Environmental Studies	Senior Lecturer
Clarke, Melissa	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Francis-Williams, Salisha	amatthew@costaatt.edu.tt	Facilities Management	Custodian I
Rodriguez, Kervin	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Ali-Parris, Haniffa	amatthew@costaatt.edu.tt	Facilities Management	Project Administrator
Anderson-Roberts, Dawn	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Charles, Frank	amatthew@costaatt.edu.tt	Facilities Management	Handyman
Charles, Teshia	amatthew@costaatt.edu.tt	Facilities Management	Architectural Technologist
Charles-Mathews, Gisell	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Daly, Kathy Ann	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Douglin, Lana	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Eastman, Minelva	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Evans-Ali, Lindy	amatthew@costaatt.edu.tt	Facilities Management	Supervisor, Facilities Support Services
Francis, Darrel	amatthew@costaatt.edu.tt	Facilities Management	Handyman
Gomez, Karen	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Grant, Camile	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Isidore-Phillip, Rose	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Jackson, Akil	amatthew@costaatt.edu.tt	Facilities Management	Facilities Technician
Jacob, Kieron	amatthew@costaatt.edu.tt	Facilities Management	Custodian I
Jones, Lenora	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Jones, Sherwin	amatthew@costaatt.edu.tt	Facilities Management	Facilities Technician
Joseph, Florencia	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Laidlow, Maria	amatthew@costaatt.edu.tt	Facilities Management	Custodian I
Laynies, Charles	amatthew@costaatt.edu.tt	Facilities Management	Facilities Technician
Leith, Rachel	amatthew@costaatt.edu.tt	Facilities Management	Custodian I
Letren, Helena	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Lopez, Beulah	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Mc Pherson, Sherma	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Noor, Salisha	amatthew@costaatt.edu.tt	Facilities Management	Facilities Support Officer
Preddie, Otis	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Riley, Paula	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Romany, Karla	amatthew@costaatt.edu.tt	Facilities Management	Facilities Support Officer
Romany, Nigel	amatthew@costaatt.edu.tt	Facilities Management	Handyman
Scott, Pamela	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Tom, Kenneth	amatthew@costaatt.edu.tt	Facilities Management	Facilities Technician
Vance, Vernon	amatthew@costaatt.edu.tt	Facilities Management	Custodian I
Williams Thomas, Joan	amatthew@costaatt.edu.tt	Facilities Management	Custodian
Williams-Layne, Erica	amatthew@costaatt.edu.tt	Facilities Management	Custodian I
Alexander-Joseph, Sarah	ddookie@costaatt.edu.tt	Finance	Accounts Clerk
Cameron, Fiona	ddookie@costaatt.edu.tt	Finance	Cashier
Daniel, Princess	ddookie@costaatt.edu.tt	Finance	Accounting Assistant
Dookie, Dawn	ddookie@costaatt.edu.tt	Finance	Director, Finance
Edwards, Heather	ddookie@costaatt.edu.tt	Finance	Cashier
Irish-Garibana, Annette	ddookie@costaatt.edu.tt	Finance	Cashier
Job, Jamilla	ddookie@costaatt.edu.tt	Finance	Cashier
Mc Phie, Sherissa	ddookie@costaatt.edu.tt	Finance	Accounting Assistant
Phillip, Amanda	ddookie@costaatt.edu.tt	Finance	Accounting Assistant
Pujadas, Elisa	ddookie@costaatt.edu.tt	Finance	Accountant I
Scanterbury, Candis	ddookie@costaatt.edu.tt	Finance	Accounting Assistant
Sealey, Nigel	ddookie@costaatt.edu.tt	Finance	Senior Accounts Clerk
Wellington, Shannon	ddookie@costaatt.edu.tt	Finance	Accounts Clerk
Worme, Chrysanta	ddookie@costaatt.edu.tt	Finance	Accounting Assistant
Zacharie-Hernandez, Allana	ddookie@costaatt.edu.tt	Finance	Accounts Clerk
Gonzales, Nadine	ngonzales@costaatt.edu.tt	Fine and Performing Arts	Chair, Department Fine and Performing Arts
Harry, Aidoo	ngonzales@costaatt.edu.tt	Fine and Performing Arts	Clerical Assistant
Lezama, Anthony	ngonzales@costaatt.edu.tt	Fine and Performing Arts	Administrative Assistant
Chalmers, Lasana	amatthew@costaatt.edu.tt	Fleet and Mail Services	Driver/Messenger
Gomez, Junior	amatthew@costaatt.edu.tt	Fleet and Mail Services	Driver/Messenger
Nelson, Kevin	amatthew@costaatt.edu.tt	Fleet and Mail Services	Driver/Messenger
Persad, Robindra	amatthew@costaatt.edu.tt	Fleet and Mail Services	Driver/Messenger
Pesnell, Ian	amatthew@costaatt.edu.tt	Fleet and Mail Services	Driver/Messenger
Small-Moo King, Gillian	amatthew@costaatt.edu.tt	Fleet and Mail Services	Clerk Typist I
Dann, Heather		Health and Counselling Services	Clerk
Mc Clean, Nadia		Health and Counselling Services	Administrative Assistant
Alexander, Taja	Alalla@costaatt.edu.ttt	Health Science Technologies	Lecturer
Balgobin-Ahamad, Marsha	Alalla@costaatt.edu.ttt	Health Science Technologies	Administrative Assistant
Lalla, Anthony	Alalla@costaatt.edu.ttt	Health Science Technologies	Chair, Health Science Technologies
Santiago, Ma.Ferlin	Alalla@costaatt.edu.ttt	Health Science Technologies	Lecturer
Sharpe, Wendy	Alalla@costaatt.edu.ttt	Health Science Technologies	Senior Lecturer
Sookdeo, Eileen	Alalla@costaatt.edu.ttt	Health Science Technologies	Programme Assistant
Hosein, Saleem	amatthew@costaatt.edu.tt	Human Resources	HSE Officer
Hypolite, Nicolle	amatthew@costaatt.edu.tt	Human Resources	Human Resource Coordinator
Junkere, Liselle	amatthew@costaatt.edu.tt	Human Resources	Administrative Assistant
Matthew, Alvinelle	knurse@costaatt.edu.tt	Human Resources	Vice President Human Resources
Noel, Stacey-Anne	amatthew@costaatt.edu.tt	Human Resources	Programme/Student Support Assistant
Stanisclaus, Marcia	amatthew@costaatt.edu.tt	Human Resources	Director, Planning and Employment
Absalom, Dexter	rchung@costaatt.edu.tt	Information Science and Technology	Senior Lecturer
Andrews, Adrian	rchung@costaatt.edu.tt	Information Science and Technology	Senior Lecturer
Bennett Alexander, Nicole	rchung@costaatt.edu.tt	Information Science and Technology	Lecturer
Bernard, Cindy	rchung@costaatt.edu.tt	Information Science and Technology	Programme Assistant
Cadogan, Andre	rchung@costaatt.edu.tt	Information Science and Technology	Senior Lecturer
Charles, Maurisa	rchung@costaatt.edu.tt	Information Science and Technology	Administrative Assistant
Chung, Roger	rchung@costaatt.edu.tt	Information Science and Technology	Chair (Ag) IST
David, Raechelle	rchung@costaatt.edu.tt	Information Science and Technology	Programme Assistant
Dennis-Nagee, Alicia	rchung@costaatt.edu.tt	Information Science and Technology	Senior Lecturer
Gokool, Maneka	rchung@costaatt.edu.tt	Information Science and Technology	Senior Lecturer
Jarvis-Patrick, Joanne	rchung@costaatt.edu.tt	Information Science and Technology	Senior Lecturer
Sterling, Job	rchung@costaatt.edu.tt	Information Science and Technology	Senior Lecturer
Williams, Stacy	rchung@costaatt.edu.tt	Information Science and Technology	Lecturer
Mc Kellar-Cumberbatch, Cheryl	amatthew@costaatt.edu.tt	Institutional Advancement	Administrative Assistant
Maharaj, Kavita	kmaharaj@costaatt.edu.tt	Internal Audit	Chief Internal Auditor
Ali, Nazia	kmaharaj@costaatt.edu.tt	Internal Audit	Senior Auditor
Rodriguez, Patsy-Ann	kmaharaj@costaatt.edu.tt	Internal Audit	Administrative Assistant
Keane, Blossom	cjack@costaatt.edu.tt	Journalism and Media Studies	Administrative Assistant
Ojoade, Oyetayo	cjack@costaatt.edu.tt	Journalism and Media Studies	Lecturer
Jack, Clarinda	cjack@costaatt.edu.tt	Ken Gordon School of Journalism and Communication Studies	Dean, Ken Gordon School of Journalism and Communication Studies
Springer, Jodene	cjack@costaatt.edu.tt	Ken Gordon School of Journalism and Communication Studies	Executive Assistant
Dial, Christian	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Senior Lecturer
Dougdeen, Karen	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Lecturer
Dyette, Raymond	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Senior Lecturer
Gill-Grill, Ines	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Senior Lecturer
Guzman, Abigail	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Senior Lecturer
Hazelwood, Shonell	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Library Technician
Hospedales, Louann	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Coordinator, Developmental English
Kendall, Kim	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Senior Lecturer
Mahase, Radica	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Senior Lecturer
Maurice-Phillip, Tamara	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Senior Lecturer
Ng Wai, Sean	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Senior Lecturer
Quildon-Doonie, Angela	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Senior Lecturer
Ryan, Jennifer	cjack@costaatt.edu.tt	Language Literature and Communication Studies	Senior Lecturer
Alfonso, Kevin		Library Services	Library Assistant I
Bernard, Nneka		Library Services	Library Technician
Browne, Arlene		Library Services	Library Aide
Charles, Judy		Library Services	Senior Library Technician
Charles, Kwame		Library Services	Library Aide
Emmons-Creft, Pauline		Library Services	Library Assistant I
Humphrey, Patricia		Library Services	Library Attendant
Irish, Judy		Library Services	Senior Library Technician
John-Miller, Alicia		Library Services	Library Technician
Lewis, Marcia		Library Services	Library Technician
Marshall, Louise		Library Services	Library Technician
Omowale, Folami		Library Services	Library Technician
Patrick, Kezia		Library Services	Library Aide
Remey, Nickisha		Library Services	Library Aide
Richardson-Drakes, Arlene		Library Services	Senior Library Technician
Samuel, Pauline		Library Services	Library Aide
Sinnette-Sequea, Nadine		Library Services	Library Technician
Stewart, Cordelia		Library Services	Senior Library Techician
Awai-King, Sarah	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Bahaw, Priscilla	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Balfour, Shaun	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Administrative Assistant
Benjamin, Clinton	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Bissoo, Wayne	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Granger-Thompson, Fiona	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Programme Assistant I
Hamid, Sajjad	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
John, Ricardo	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Programme Assistant
Khan, Jerome	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Kissoon-Weekes, Jinelle	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Lezama, Danelle	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Mc Gowan-Santana, Kyra	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Medine, Ambica	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Mungaldeen, Charmaine	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Ramsundar, Giselle	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Scott, Patrice	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Programme Assistant I
Sealey, Heather-Dawn	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Chair, Management and Entreprenuership
Soogrim, Carlton	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Stewart-Ache, Antoinette	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Stoute, Tracey	hsealey@costaatt.edu.tt	Management and Entrepreneurship	Senior Lecturer
Mark, Taslim		Marketing and Public Relations	Marketing and Public Relations Officer
Cutting, Lachelle		Marketing and Public Relations	Service Attendant
Simon, Dawnelle		Marketing and Public Relations	Clerical Assistant
Sylvester, Karla		Marketing and Public Relations	Marketing and Public Relations Assistant
Robinson, Mwenda		Marketing and Public Relations	Marketing and Public Relations Graphic Design
Clarke, Anthea	aclarke@costaatt.edu.tt	Mathematics	Senior Lecturer
Felix, Alton	aclarke@costaatt.edu.tt	Mathematics	Senior Lecturer
La Coa, Kizzi	aclarke@costaatt.edu.tt	Mathematics	Senior Lecturer
La Rose, Hamere	aclarke@costaatt.edu.tt	Mathematics	Senior Lecturer
Leela, Jeffrey	aclarke@costaatt.edu.tt	Mathematics	Senior Lecturer
Maurice, Brian	aclarke@costaatt.edu.tt	Mathematics	Senior Lecturer
Maynard, Jeffrey	aclarke@costaatt.edu.tt	Mathematics	Senior Lecturer
Moses, Juliana	aclarke@costaatt.edu.tt	Mathematics	Programme Assistant I
Pierre, Joanne	aclarke@costaatt.edu.tt	Mathematics	Senior Lecturer
Ramdial-Sookan, Parvati	aclarke@costaatt.edu.tt	Mathematics	Lecturer
Ramlal, Laura	aclarke@costaatt.edu.tt	Mathematics	Senior Lecturer
Ramlal, Robin	aclarke@costaatt.edu.tt	Mathematics	Senior Lecturer
Abdul, Raqib	dwilson@costaatt.edu.tt	Natural and Life Sciences	Laboratory Coordinator
Bidaisee, Sheldon	dwilson@costaatt.edu.tt	Natural and Life Sciences	Senior Lecturer
Bovell, Nyron	dwilson@costaatt.edu.tt	Natural and Life Sciences	Senior Lecturer
Campbell, Patrick	dwilson@costaatt.edu.tt	Natural and Life Sciences	Senior Lecturer
Cooper, Jameson	dwilson@costaatt.edu.tt	Natural and Life Sciences	Laboratory Technician
Durham, Jenna	dwilson@costaatt.edu.tt	Natural and Life Sciences	Programme Assistant I
George, Shaloma	dwilson@costaatt.edu.tt	Natural and Life Sciences	Administrative Assistant
Guptar, Kyle	dwilson@costaatt.edu.tt	Natural and Life Sciences	Laboratory Technician
Joseph, Nadia	dwilson@costaatt.edu.tt	Natural and Life Sciences	Programme Assistant
Kalloo, Risha	dwilson@costaatt.edu.tt	Natural and Life Sciences	Senior Lecturer
Mohammed, Jeffrey	dwilson@costaatt.edu.tt	Natural and Life Sciences	Senior Lecturer
Mohansingh, Shashiprabha	dwilson@costaatt.edu.tt	Natural and Life Sciences	Laboratory Coordinator
Olton, Romona	dwilson@costaatt.edu.tt	Natural and Life Sciences	Senior Lecturer
Rampersad, Ravi	dwilson@costaatt.edu.tt	Natural and Life Sciences	Senior Lecturer
Roopnarine, Hema	dwilson@costaatt.edu.tt	Natural and Life Sciences	Senior Lecturer
Sahibdeen, Saeeda	dwilson@costaatt.edu.tt	Natural and Life Sciences	Senior Lecturer
Seenarine, Shireen	dwilson@costaatt.edu.tt	Natural and Life Sciences	Senior Lecturer
Singh, Anuradha	dwilson@costaatt.edu.tt	Natural and Life Sciences	Senior Lecturer
Wilson, Delamae	dwilson@costaatt.edu.tt	Natural and Life Sciences	Chair, Natural Life Sciences
George, Corey	jtobas@costaatt.edu.tt	Nursing	Clinical Instructor
Hamlet-Cooper, Tessima	jtobas@costaatt.edu.tt	Nursing	Clinical Instructor
Roberts-Harroo, Dave-Anne	jtobas@costaatt.edu.tt	Nursing	Clinical Instructor
Theroulde, Alicia	jtobas@costaatt.edu.tt	Nursing	Clinical Instructor
Alleyne, Carla	jtobas@costaatt.edu.tt	Nursing	Programme Assistant I
Alleyne, Kenneth	jtobas@costaatt.edu.tt	Nursing	Office Attendant
Bascombe Mc Cave, Carolyn	jtobas@costaatt.edu.tt	Nursing	Senior Lecturer
Boodoosingh-Dwarika, Anjenney	jtobas@costaatt.edu.tt	Nursing	Dean School of Nursing, Health and Environmental Sciences
Bremnor, Abraham	jtobas@costaatt.edu.tt	Nursing	Senior Lecturer
Caesar-Pecome, Marsha	jtobas@costaatt.edu.tt	Nursing	Senior Lecturer
Charles Jones Tobas, Jesinta	jtobas@costaatt.edu.tt	Nursing	Senior Lecturer
Charles-Stuart, Alicia	jtobas@costaatt.edu.tt	Nursing	Clinical Instructor
Garibsingh, Rhonda	jtobas@costaatt.edu.tt	Nursing	Administrative Assistant
Gibson, Catherine	jtobas@costaatt.edu.tt	Nursing	Clerical Assistant
Girdharry, Crystal	jtobas@costaatt.edu.tt	Nursing	Programme Assistant
Henry, Joann	jtobas@costaatt.edu.tt	Nursing	Administrative Assistant
Jacob, Marvalon	jtobas@costaatt.edu.tt	Nursing	Programme Assistant
Jarvis-Isaac, Rita	jtobas@costaatt.edu.tt	Nursing	Senior Lecturer
Karim, Riaz	jtobas@costaatt.edu.tt	Nursing	Simulation Laboratory Coordinator
Mc Pherson, Delka	jtobas@costaatt.edu.tt	Nursing	Senior Lecturer
Metivier-Carrington, Gail	jtobas@costaatt.edu.tt	Nursing	Senior Lecturer
Mir, Ruhee	jtobas@costaatt.edu.tt	Nursing	Senior Lecturer
Mohess, Yatasha	jtobas@costaatt.edu.tt	Nursing	Clinical Instructor
Rambaran, Amrika	jtobas@costaatt.edu.tt	Nursing	Clinical Instructor
Ramdeen-Lutchman, Gemma	jtobas@costaatt.edu.tt	Nursing	Clerical Assistant
Sandy, Lisa	jtobas@costaatt.edu.tt	Nursing	Research Assistant
Syne, Susan	jtobas@costaatt.edu.tt	Nursing	Clinical Instructor
Walker, Alicia	jtobas@costaatt.edu.tt	Nursing	Lecturer
Whiskey, Indra	jtobas@costaatt.edu.tt	Nursing	Lecturer
Alonzo-Williams, Carla	knurse@costaatt.edu.tt	Office of the Assistant to the President	Assistant to the President
Banfield, Kempson	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Programme Officer
Castro, Rachel	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Programme Assistant I
Cumberbatch, Rhonda	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	College Registrar
Jagpath, Allison	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Clerk Typist I
King, Gwyneth	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Registrar, Assistant
Madoo, Karen	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Administrative Assistant
Martineau, Keisha	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Clerical Assistant
Mollick, Zalina	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Administrative Assistant
Paul, Gideon	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Administrative Assistant
Pope, Kellyann	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Programme Assistant I
Ragoopath, Maltie	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Programme Assistant I
Riley, Kinda	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Administrative Assistant
Sandiford, Lea-Andro	rcumberbatch@costaatt.edu.tt	Office of the College Registrar	Administrative Assistant
Singh, Sheena	LSolomon@costaatt.edu.tt	Office of the Corporate Secretary	Administrative Assistant
Solomon, Lisa	LSolomon@costaatt.edu.tt	Office of the Corporate Secretary	Corporate Secretary
Gordon, Mandisa	nsylvester@costaatt.edu.tt	Office of the Dean, School of Liberal Arts and Human Services	Administrative Cadet
Sylvester, Neil	nsylvester@costaatt.edu.tt	Office of the Dean, School of Liberal Arts and Human Services	Dean, School of Liberal Arts and Human Services
Amar, Rodney	knurse@costaatt.edu.tt	Office of the President	Senior Project Officer
Nurse, Keith	knurse@costaatt.edu.tt	Office of the President	President
Alonzo-Williams, Carla	knurse@costaatt.edu.tt	Office of the President	Assistant to the President
Thomas, Nigel	rcumberbatch@costaatt.edu.tt	Office of the Registrar	Executive Assistant
Carmichael, Leonette	amatthew@costaatt.edu.tt	Procurement	Purchasing Assistant
Johnson, Aaliya	amatthew@costaatt.edu.tt	Procurement	Accounts Clerk
La Roche, Reyon	amatthew@costaatt.edu.tt	Procurement	Service Attendant
Stewart, Gia-Marie	amatthew@costaatt.edu.tt	Procurement	Administrative Assistant
Williams, Sherneka	amatthew@costaatt.edu.tt	Procurement	Purchasing Assistant II
Baptiste, Troy	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Caldeira-Hall, Emris	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Caldon, John	amatthew@costaatt.edu.tt	Public Safety and Security Services	Assistant Campus Security Supervisor
County-Trancoso, Carol	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Lalchan, Melissa	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Lewis, Nigel	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Murray, Nigel	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Nedd, Neila	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Phillips, Kyle	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Sutton, Ricardo	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Taylor, Joel	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Thompson, Cherian	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Torres, Kirk	amatthew@costaatt.edu.tt	Public Safety and Security Services	Campus Security Officer
Bynoe, Valline	dpersad@costaatt.edu.tt	Quality Assurance and Institutional Research	Research Assistant II
Lyiscott-Barrow, Gillian	dpersad@costaatt.edu.tt	Quality Assurance and Institutional Research	Research Officer
Persad, Doodnath	dpersad@costaatt.edu.tt	Quality Assurance and Institutional Research	Director, Quality Assurance and Institutional Research
Sargeant, Roxanne	dpersad@costaatt.edu.tt	Quality Assurance and Institutional Research	Research Officer
Ferguson, Sharon		Reception and Hospitality Services	Telephone Operator/Receptionist
Mohammed, Fazia		Reception and Hospitality Services	Maid
Garib, Shalini		Sangre Grande Campus	Coordinator, Business Services
Sinanan, Grace		Sangre Grande Campus	Executive Assistant
Joseph, Leticia		School of Continuing Education and Lifelong Learning	Administrative Assistant
Ramlal-Chirkoot, Lalita		School of Continuing Education and Lifelong Learning	Dean, School of Continuing Education and Lifelong Learning
Munroe, Anderson		Social and Behavioral Sciences	Senior Lecturer
Arnold, Tashawnda		Social and Behavioral Sciences	Programme Assistant
Barclay, Rosalie		Social and Behavioral Sciences	Senior Lecturer
Bertrand-Charles, Ayanna		Social and Behavioral Sciences	Senior Lecturer
Humphrey, Melina		Social and Behavioral Sciences	Senior Lecturer
Mc Intosh, Tricia		Social and Behavioral Sciences	Senior Lecturer
Nelson, Vanessa		Social and Behavioral Sciences	Senior Lecturer
Pooran-Roodal, Mervyn		Social and Behavioral Sciences	Senior Lecturer
St Rose, Nneka		Social and Behavioral Sciences	Senior Lecturer
Wills, Nicole		Social and Behavioral Sciences	Senior Lecturer
Ali, Nazreen	nkoylass@costaatt.edu.tt	South Campus	Cashier
Gibson, Safiya	nkoylass@costaatt.edu.tt	South Campus	Administrative Assistant
Heeradhan, Jeniffer	nkoylass@costaatt.edu.tt	South Campus	Coordinator, Academic and Student Support
Hosein, Vashantie	nkoylass@costaatt.edu.tt	South Campus	Cordinator, Business Services
Jobe, Leslie-Ann	nkoylass@costaatt.edu.tt	South Campus	Clerk
Manickchand-Birwar, Crystal	nkoylass@costaatt.edu.tt	South Campus	Executive Assistant
Cumberbatch, Helen	knurse@costaatt.edu.tt	Student Affairs	Vice President Student Affairs
Carter, Ian	icarter@costaatt.edu.tt	Student Life and Athletics	Director, Student Life and Athletics
Mc Clean, Annette	icarter@costaatt.edu.tt	Student Life and Athletics	Administrative Assistant
Ramah, Nigel	icarter@costaatt.edu.tt	Student Life and Athletics	Service Attendant
Thomas, Janeller	icarter@costaatt.edu.tt	Student Life and Athletics	Programme Assistant I
Ali, Heather	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician
Alimayu, Kayode		Technology Services	Network Administrator
Assam-Arneaud, Johann	dheadley@costaatt.edu.tt	Technology Services	Systems Administrator
Baboolal, Brian	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician
Benn, Isaiah	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician
Charles, Kathy-Ann		Technology Services	Programmer/Analyst
Dhannie, Varick	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician
Dolly, Donald	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician
Goodridge, Randolph		Technology Services	Network Administrator
Headley, Darren	dheadley@costaatt.edu.tt	Technology Services	Help Desk Supervisor
Headley, Melissa		Technology Services	Programmer/Analyst
Jakhoo, Kevin	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician
Mc Clean, Adali	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician
Mitchell, Aaron	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician
Parasram, Shiva		Technology Services	Information Security Administrator
Ramrattan, Varune	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician
Rattansingh, Darren		Technology Services	Programmer/Analyst
Reece, Kevin	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician
Romero, Deborah	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician
Thomas, Kegan	dheadley@costaatt.edu.tt	Technology Services	Computer Maintenance Technician.
Chase, Elise	amatthew@costaatt.edu.tt	Tobago Campus	Cashier
Durham, Patricia	amatthew@costaatt.edu.tt	Tobago Campus	Custodian
James, Dane	amatthew@costaatt.edu.tt	Tobago Campus	Facilities Technician
James, Sophia	amatthew@costaatt.edu.tt	Tobago Campus	Executive Assistant
Kirk, Shanice	amatthew@costaatt.edu.tt	Tobago Campus	Programme/Student Support Assistant
Manswell, Nuhvaughn	amatthew@costaatt.edu.tt	Tobago Campus	Clerical Assistant
de Lancey, Mariel	cstclair@costaatt.edu.tt	Translation and Interpretation Service	Senior Lecturer
Hackett, Krystal	cstclair@costaatt.edu.tt	Translation and Interpretation Service	Clerical Assistant
Leonard-St.Clair, Chantale	cstclair@costaatt.edu.tt	Translation and Interpretation Services	Director, Translation and Interpretation`;

interface ParsedPerson {
  fullName: string;
  hodEmail: string;
  dept: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
}

interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dept: string;
  title: string | null;
  active: boolean;
}

interface MatchResult {
  person: ParsedPerson;
  employee: Employee | null;
  matchType: 'EXACT' | 'AMBIGUOUS' | 'MISSING';
  candidates?: Employee[];
  departmentMatch: boolean;
  jobTitleMatch: boolean;
  hodEmailIssue?: string;
}

// Helper functions
function normalizeName(name: string): { firstName: string; lastName: string } {
  const normalized = name.trim().replace(/\s+/g, ' ');
  
  if (normalized.includes(',')) {
    const [last, first] = normalized.split(',').map(s => s.trim());
    return { firstName: first, lastName: last };
  } else {
    const parts = normalized.split(' ');
    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, -1).join(' ');
    return { firstName, lastName };
  }
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function similarity(a: string, b: string): number {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);
  
  if (s1 === s2) return 1.0;
  
  // Simple Jaro-Winkler implementation
  const len1 = s1.length;
  const len2 = s2.length;
  
  if (len1 === 0 || len2 === 0) return 0.0;
  
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0.0;
  
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  
  // Winkler prefix bonus
  let prefix = 0;
  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  
  return jaro + (prefix * 0.1 * (1 - jaro));
}

function checkHodEmail(email: string): string | undefined {
  if (!email || email.trim() === '') return 'Missing HOD email';
  if (email.includes('edu.ttt')) return 'Typo in domain (.ttt instead of .tt)';
  if (!email.endsWith('@costaatt.edu.tt')) return 'Invalid domain (not @costaatt.edu.tt)';
  return undefined;
}

async function parseRawList(): Promise<ParsedPerson[]> {
  const lines = RAW_LIST.split('\n').filter(line => line.trim() && !line.startsWith('Appraised Person'));
  
  return lines.map(line => {
    const [fullName, hodEmail, dept, jobTitle] = line.split('\t');
    const { firstName, lastName } = normalizeName(fullName);
    
    return {
      fullName: fullName.trim(),
      hodEmail: hodEmail?.trim() || '',
      dept: dept?.trim() || '',
      jobTitle: jobTitle?.trim() || '',
      firstName,
      lastName
    };
  });
}

async function loadEmployees(): Promise<Employee[]> {
  const employees = await prisma.employee.findMany({
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          title: true,
          active: true
        }
      }
    }
  });
  
  return employees.map(emp => ({
    id: emp.id,
    email: emp.user.email,
    firstName: emp.user.firstName,
    lastName: emp.user.lastName,
    dept: emp.dept,
    title: emp.user.title,
    active: emp.user.active
  }));
}

function findMatches(person: ParsedPerson, employees: Employee[]): MatchResult {
  const { firstName, lastName, dept, jobTitle, hodEmail } = person;
  
  // STRICT: Exact match
  const exactMatches = employees.filter(emp => 
    normalizeText(emp.firstName) === normalizeText(firstName) &&
    normalizeText(emp.lastName) === normalizeText(lastName)
  );
  
  if (exactMatches.length === 1) {
    const employee = exactMatches[0];
    return {
      person,
      employee,
      matchType: 'EXACT',
      departmentMatch: normalizeText(employee.dept) === normalizeText(dept),
      jobTitleMatch: normalizeText(employee.title || '') === normalizeText(jobTitle),
      hodEmailIssue: checkHodEmail(hodEmail)
    };
  }
  
  if (exactMatches.length > 1) {
    return {
      person,
      employee: null,
      matchType: 'AMBIGUOUS',
      candidates: exactMatches,
      departmentMatch: false,
      jobTitleMatch: false,
      hodEmailIssue: checkHodEmail(hodEmail)
    };
  }
  
  // RELAXED: Contains match
  const relaxedMatches = employees.filter(emp => 
    normalizeText(emp.firstName).includes(normalizeText(firstName)) ||
    normalizeText(firstName).includes(normalizeText(emp.firstName)) ||
    normalizeText(emp.lastName).includes(normalizeText(lastName)) ||
    normalizeText(lastName).includes(normalizeText(emp.lastName))
  );
  
  if (relaxedMatches.length === 1) {
    const employee = relaxedMatches[0];
    return {
      person,
      employee,
      matchType: 'EXACT',
      departmentMatch: normalizeText(employee.dept) === normalizeText(dept),
      jobTitleMatch: normalizeText(employee.title || '') === normalizeText(jobTitle),
      hodEmailIssue: checkHodEmail(hodEmail)
    };
  }
  
  if (relaxedMatches.length > 1) {
    return {
      person,
      employee: null,
      matchType: 'AMBIGUOUS',
      candidates: relaxedMatches,
      departmentMatch: false,
      jobTitleMatch: false,
      hodEmailIssue: checkHodEmail(hodEmail)
    };
  }
  
  // FUZZY: Similarity match
  const fuzzyMatches = employees.map(emp => ({
    employee: emp,
    score: Math.max(
      similarity(`${firstName} ${lastName}`, `${emp.firstName} ${emp.lastName}`),
      similarity(`${lastName} ${firstName}`, `${emp.lastName} ${emp.firstName}`)
    )
  })).filter(match => match.score >= 0.88).sort((a, b) => b.score - a.score);
  
  if (fuzzyMatches.length === 1) {
    const employee = fuzzyMatches[0].employee;
    return {
      person,
      employee,
      matchType: 'EXACT',
      departmentMatch: normalizeText(employee.dept) === normalizeText(dept),
      jobTitleMatch: normalizeText(employee.title || '') === normalizeText(jobTitle),
      hodEmailIssue: checkHodEmail(hodEmail)
    };
  }
  
  if (fuzzyMatches.length > 1) {
    return {
      person,
      employee: null,
      matchType: 'AMBIGUOUS',
      candidates: fuzzyMatches.map(m => m.employee),
      departmentMatch: false,
      jobTitleMatch: false,
      hodEmailIssue: checkHodEmail(hodEmail)
    };
  }
  
  // MISSING
  return {
    person,
    employee: null,
    matchType: 'MISSING',
    departmentMatch: false,
    jobTitleMatch: false,
    hodEmailIssue: checkHodEmail(hodEmail)
  };
}

async function writeReports(results: MatchResult[]) {
  const reportsDir = join(__dirname, '../../reports/verification');
  console.log(`📁 Creating reports directory: ${reportsDir}`);
  await fs.mkdir(reportsDir, { recursive: true });
  
  // Matched CSV
  const matched = results.filter(r => r.matchType === 'EXACT' && r.employee);
  const matchedCsv = [
    'FullName,FirstName,LastName,ListDepartment,DBDepartment,ListJobTitle,DBJobTitle,DBEmail,MatchType'
  ].concat(matched.map(r => 
    `"${r.person.fullName}","${r.person.firstName}","${r.person.lastName}","${r.person.dept}","${r.employee!.dept}","${r.person.jobTitle}","${r.employee!.title || ''}","${r.employee!.email}","${r.matchType}"`
  )).join('\n');
  
  await fs.writeFile(join(reportsDir, 'matched.csv'), matchedCsv);
  
  // Missing CSV
  const missing = results.filter(r => r.matchType === 'MISSING');
  const missingCsv = [
    'FullName,HODEmail,Department,JobTitle,Reason'
  ].concat(missing.map(r => 
    `"${r.person.fullName}","${r.person.hodEmail}","${r.person.dept}","${r.person.jobTitle}","Not found in database"`
  )).join('\n');
  
  await fs.writeFile(join(reportsDir, 'missing_in_db.csv'), missingCsv);
  
  // Ambiguous CSV
  const ambiguous = results.filter(r => r.matchType === 'AMBIGUOUS');
  const ambiguousCsv = [
    'FullName,CandidateCount,TopCandidates'
  ].concat(ambiguous.map(r => 
    `"${r.person.fullName}","${r.candidates!.length}","${r.candidates!.map(c => `${c.firstName} ${c.lastName} <${c.email}> | ${c.dept} | ${c.title || ''}`).join('; ')}"`
  )).join('\n');
  
  await fs.writeFile(join(reportsDir, 'ambiguous_matches.csv'), ambiguousCsv);
  
  // Mismatches CSV
  const mismatches: Array<{fullName: string, field: string, listValue: string, dbValue: string, dbEmail: string}> = [];
  
  matched.forEach(r => {
    if (r.employee && !r.departmentMatch) {
      mismatches.push({
        fullName: r.person.fullName,
        field: 'Department',
        listValue: r.person.dept,
        dbValue: r.employee.dept,
        dbEmail: r.employee.email
      });
    }
    if (r.employee && !r.jobTitleMatch) {
      mismatches.push({
        fullName: r.person.fullName,
        field: 'JobTitle',
        listValue: r.person.jobTitle,
        dbValue: r.employee.title || '',
        dbEmail: r.employee.email
      });
    }
  });
  
  const mismatchesCsv = [
    'FullName,Field,ListValue,DBValue,DBEmail'
  ].concat(mismatches.map(m => 
    `"${m.fullName}","${m.field}","${m.listValue}","${m.dbValue}","${m.dbEmail}"`
  )).join('\n');
  
  await fs.writeFile(join(reportsDir, 'mismatches.csv'), mismatchesCsv);
  
  // HOD Email Issues CSV
  const hodIssues = results.filter(r => r.hodEmailIssue);
  const hodIssuesCsv = [
    'FullName,HODEmail,Issue'
  ].concat(hodIssues.map(r => 
    `"${r.person.fullName}","${r.person.hodEmail}","${r.hodEmailIssue}"`
  )).join('\n');
  
  await fs.writeFile(join(reportsDir, 'hod_email_issues.csv'), hodIssuesCsv);
}

async function main() {
  try {
    console.log('🔄 Starting appraised persons verification...\n');
    
    const persons = await parseRawList();
    const employees = await loadEmployees();
    
    console.log(`📊 Loaded ${persons.length} persons from list`);
    console.log(`📊 Loaded ${employees.length} employees from database\n`);
    
    const results = persons.map(person => findMatches(person, employees));
    
    await writeReports(results);
    
    // Console summary
    const exact = results.filter(r => r.matchType === 'EXACT').length;
    const ambiguous = results.filter(r => r.matchType === 'AMBIGUOUS').length;
    const missing = results.filter(r => r.matchType === 'MISSING').length;
    const mismatchesDept = results.filter(r => r.matchType === 'EXACT' && r.employee && !r.departmentMatch).length;
    const mismatchesJob = results.filter(r => r.matchType === 'EXACT' && r.employee && !r.jobTitleMatch).length;
    const hodIssues = results.filter(r => r.hodEmailIssue).length;
    
    console.log('📈 VERIFICATION SUMMARY:');
    console.log(`• Total in list: ${persons.length}`);
    console.log(`• Exact matches: ${exact}`);
    console.log(`• Ambiguous matches: ${ambiguous}`);
    console.log(`• Missing in DB: ${missing}`);
    console.log(`• Department mismatches: ${mismatchesDept}`);
    console.log(`• Job title mismatches: ${mismatchesJob}`);
    console.log(`• HOD email issues: ${hodIssues}\n`);
    
    console.log('📄 Reports written to reports/verification/:');
    console.log('• matched.csv');
    console.log('• missing_in_db.csv');
    console.log('• ambiguous_matches.csv');
    console.log('• mismatches.csv');
    console.log('• hod_email_issues.csv\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
