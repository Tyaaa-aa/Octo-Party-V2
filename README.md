#  Octo.Party



Octo.Party is a straightforward solution for watching multiple Twitch streams at once. With Octo Party, you can easily create lists of Twitch streams to watch simultaneously, and generate shareable links to share with your friends.



##  Features



-  **Multi-Stream Viewing**: Watch multiple Twitch streams concurrently

-  **Notifications**: Get notified when your favourite streamer comes online

-  **Create Your Own List**: Easily create and manage your list of Twitch streams

-  **Streamlined Experience**: Enjoy a straightforward and intuitive interface for seamless viewing

-  **Shareable Lists**: Create shareable links for your list to send your friends or to your other devices

-  **No Accounts**: No need to sign up or login. Just add your favourite streamers and Octo.Party will save your data locally



##  Usage



###  Installation



Clone the repository:



```bash

git  clone  https://github.com/Tyaaa-aa/Octo-Party-V2.git

```



Install dependencies:



```bash

cd  octo-party

npm  install

```



###  Development Server



Start the development server:



```bash

npm  run  dev

```



The application will be running at [http://localhost:3000](http://localhost:3000).



###  Production Build



Build the application for production:



```bash

npm  run  build

```



Preview the production build locally:



```bash

npm  run  preview

```


###  Twitch API Key
You can get your Twitch API keys at the [Twitch Developers Console](https://dev.twitch.tv/console) 


###  Database



[Supabase](https://supabase.com/docs) is used for storing shared lists. Here is the DB structure 

Table Name: `shared_links_table`

| Name         | Data Type              |
|--------------|------------------------|
| id           | bigint (int8)          |
| created_at   | timestamp with time zone (timestamptz) |
| shared_data  | text                   |
| shared_link  | text                   |



###  Enviroment Variables
Create your `.env` file, copy the following and add your keys

```
SUPABASE_KEY=<YOUR_SUPABASE_KEY>
SUPABASE_URL=<YOUR_SUPABASE_URL>
TWITCH_CLIENTID=<YOUR_TWITCH_CLIENTID>
TWITCH_SECRET=<YOUR_TWITCH_SECRET>
```

##  Contributing



Contributions are welcome! If you'd like to contribute to Octo.Party, please follow these steps:



1.  Fork the repository.

2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).

3.  Commit your changes (`git commit -m 'Add some amazing feature'`).

4.  Push to the branch (`git push origin feature/AmazingFeature`).

5.  Open a pull request.



##  License



This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.txt) - see the [LICENSE](LICENSE) file for details.



##  Contact



For any inquiries or feedback, feel free to reach out to us at [contact@octo.party](mailto:contact@octo.party).