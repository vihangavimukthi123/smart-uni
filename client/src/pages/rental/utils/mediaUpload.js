import { createClient } from "@supabase/supabase-js";

const url = "https://gknqtfpezpxkyqevhstt.supabase.co";
const key =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbnF0ZnBlenB4a3lxZXZoc3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTI2NzUsImV4cCI6MjA5MDE2ODY3NX0.kFUmL-ge0KJXRSMgVirEH45FkmK8gmWAnunO7tKZuu0";

const supabase = createClient(url, key);

export default function uploadFile(file) {
	return new Promise((resolve, reject) => {
		const timeStamp = Date.now();
		const fileName = timeStamp + "_" + file.name;
		supabase.storage.from("images").upload(fileName, file, {
			cacheControl: "3600",
			upsert: false,
		}).then(
            ()=>{
                const publicUrl = supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl;
                resolve(publicUrl);
            }
        ).catch((error)=>{
            reject(error);
        })
	});
}