const sequelize = require("./koneksi");

// 1️⃣ Models that nothing depends on
const categoryController = require("./controllers/categoryController");
const userController = require("./controllers/userController");

// 2️⃣ Models that depend on user/category
const doctorController = require("./controllers/doctorController");
const patientController = require("./controllers/patientController");

// 3️⃣ Models that depend on doctor/patient
const appointmentController = require("./controllers/appointmentController");

// 4️⃣ Models that depend on appointment/patient/doctor
const recordController = require("./controllers/RecordController");

// 5️⃣ Utilities (safe to be last)
const querystring = require("querystring");
const auth = require("./auth");

let cur_user;
let cur_role;

sequelize.sync().then((result)=>{
    // console.log(result);
}).catch((err)=>{
    // console.log(err);
});

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    console.log(req.method + " / " + req.url);
    const urlsplit = req.url.split("/");
    // KODE GREGORIUS WILLIAM LOGIN
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(302, { Location: '/login' });
        res.end();
    }

    else if (req.method === 'GET' && req.url === '/login') {
        fs.readFile(path.join(__dirname, "views", "login.html"), (err, data)=>{
            if (err) {
                console.log("Gagal memanggil view");
                res.writeHead(500, {"Content-Type":"text/plain"});
                res.end("Gagal mengambil view");
            } 
            else{
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }
    // KODE WILL GREG POST LOGIN

    else if (req.method === 'POST' && req.url === '/login'){
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {  
            const formData = querystring.parse(body);
        let user;
        if (formData.loginType === 'username') {
            user = userController.findByUsername(formData.username);
        }

        else if (formData.loginType === 'email') {
            user =  userController.findByEmail(formData.email);
        }
        else if (formData.loginType === 'phone') {
            user = userController.findByPhone(formData.phone);
        }

        if (!user) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            return res.end('Invalid login type');
        }
        
        user.then(us=>{
            if (us && us.password === formData.password){
                if(us.role === "patient"){
                    res.writeHead(302,
                    {'Location': '/home',
                        'Set-Cookie': `userId=${us.id_user}; HttpOnly; Path=/`
                    }
                );  
                res.end();

                }else{
                    res.writeHead(302,
                    {'Location': '/homeadmin',
                    'Set-Cookie': `userId=${us.id_user}; HttpOnly; Path=/`
                    });  
                    res.end();
                }
            } else {
                fs.readFile(path.join(__dirname, "views", "login.html"), (err, html) => {
                    if (err) {
                        console.log("Gagal memanggil view");
                        res.writeHead(500, { "Content-Type": "text/plain" });
                        res.end("Gagal mengambil view");
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(html + '<p style="color:red;">Invalid username/email/phone or password</p>');
                    }
                });
            }
        });
    });
    }

    // KODE GREGORIUS WILLIAM GET SIGNUP
    else if (req.method === 'GET' && req.url === '/signup') {
        fs.readFile(path.join(__dirname, "views", "signup.html"), (err, data)=>{
            if (err) {
                console.log("Gagal memanggil view");
                res.writeHead(500, {"Content-Type":"text/plain"});
                res.end("Gagal mengambil view");
            } 
            else{
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }

    // KODE WILL GREG POST SIGNUP
    else if (req.method === 'POST' && req.url === '/signup') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on("end", ()=>{
            const formData = querystring.parse(body);
             if(!formData.city_of_birth || !formData.date_of_birth || !formData.address ||  !formData.first_name || !formData.last_name  || !formData.gender || !formData.blood_type || !formData.condition || !formData.username || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword ){
                        res.writeHead(400, {"Content-Type": "text/plain"});
                        return res.end("Error: Semua harus diisi!");
            }  
            
             const dob = new Date(formData.date_of_birth);

                    const today = new Date();
                    const minDate = new Date();
                    minDate.setFullYear(today.getFullYear() - 12);
                    if (dob > minDate) {
                        res.writeHead(403, { "Content-Type": "text/html"});
                        res.end(`
                            <script>
                                alert("Pasien yang bisa mendaftar adalah 12 tahun");
                                window.location.href = "/signup"; 
                            </script>`
                        );
                        return;
                    }
            if (formData.password !== formData.confirmPassword) {
                fs.readFile(path.join(__dirname, "views", "signup.html"), (err, data)=>{
                    if (err) {
                        console.log("Gagal memanggil view");
                        res.writeHead(500, {"Content-Type":"text/plain"});
                        res.end("Gagal mengambil view");
                    } 
                    else{
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(data + '<p style="color:red;">Password did not match</p>');
                    }
                });
            }
           
            else{
                userController.findByUsername(formData.username).then(exists=>{
                    if(exists){
                        fs.readFile(path.join(__dirname, "views", "signup.html"), (err, data)=>{
                            if (err) {
                                console.log("Gagal memanggil view");
                                res.writeHead(500, {"Content-Type":"text/plain"});
                                res.end("Gagal mengambil view");
                            } 
                            else{
                                res.writeHead(200, { 'Content-Type': 'text/html' });
                                res.end(data + '<p style="color:red;">Username already exists. Please try another.</p>');
                            }
                        });
                    }
                    else {
                        userController.createUserPatient(formData).then(apt =>{
                        res.writeHead(302, {"Location" : "/login"});
                        res.end();
                    });

                    }
                });   
            }
        });
    }

    // KODE WILLIAM GREG HOME
    else if (req.method === 'GET' && req.url === '/home') {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "patient"){
                    fs.readFile(path.join(__dirname, "views", "home.html"), (err, data)=>{
                        if (err) {
                            console.log("Gagal memanggil view");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal mengambil view");
                        } else {
                            userController.findById(userId).then(user=>{
                                res.writeHead(200, { 'Content-Type': 'text/html' });
                                cur_role = user.role;
                                res.end(data);
                            })
                        }
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                        alert("Anda tidak memiliki akses");
                        window.location.href = "/login"; 
                    </script>`);
                }
            }) 
        });
    }

    else if (req.method === 'GET' && req.url === '/homeadmin') {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "admin"){
                    fs.readFile(path.join(__dirname, "views", "homeadmin.html"), (err, data)=>{
                            if (err) {
                                console.log("Gagal memanggil view");
                                res.writeHead(500, {"Content-Type":"text/plain"});
                                res.end("Gagal mengambil view");
                            } 
                            else{
                                userController.findById(userId).then(user=>{
                                    res.writeHead(200, { 'Content-Type': 'text/html' });
                                    cur_role = user.role;
                                    res.end(data);
                                })
                                
                            }
                        });
                }
                else{
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                        alert("Anda tidak memiliki akses");
                        window.location.href = "/login"; 
                    </script>`);
                }
            })
        });
    }

    // KODE WILLIAM GREG LOGOUT
    else if (req.method === 'GET' && req.url === '/logout') {
        res.writeHead(302, {
            'Location': '/login',
            'Set-Cookie': 'userId=; HttpOnly; Path=/; Max-Age=0'
        });
        res.end();
    }

    // KODE TAMPILAN DOKTER
    else if (req.url  === "/doctors" && req.method === "GET") {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "patient"){
                    fs.readFile(path.join(__dirname, "views", "doctor.html"), (err, data) => {
                        if (err) {
                            console.log("Gagal memanggil view");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal mengambil view");
                        } 
                        else {
                            try{
                                doctorController.getAllDoctor().then(doctors=>{
                                    categoryController.getAllCategory().then(categories=>{
                                        const html = data.toString().replace("<!--DOCTOR_DATA-->", JSON.stringify(doctors))
                                        .replace("<!--CATEGORY_DATA-->", JSON.stringify(categories));
                                        res.writeHead(200, {"Content-Type":"text/html"});
                                        res.end(html);
                                    })
                                
                                });
                            
                            }
                            catch(err){
                                res.writeHead(500, {"Content-Type":"text/plain"});
                                res.end("Gagal mengambil data");
                            }
                                
                        }
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                        alert("Anda tidak memiliki akses");
                        window.location.href = "/"; 
                    </script>`);
                }
            });
        });
    }

    // KODE APPOINTMENT POST
    else if (req.url  === "/appointment" && req.method === "POST") {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "patient"){
                    let body = "";
                    req.on("data", chunk => {
                        body += chunk.toString();
                    });
                    req.on("end", ()=>{
                        const formData = querystring.parse(body);

                        fs.readFile(path.join(__dirname, "views", "appointment.html"), (err, data) => {
                            if (err) {
                                console.log("Gagal memanggil view");
                                res.writeHead(500, {"Content-Type":"text/plain"});
                                res.end("Gagal melngambil view");
                            } 
                            else {
                                const cookies = auth.parseCookies(req);
                                const userId = cookies.userId;
                                patientController.getPatientByIdUser(userId).then(pt=>{
                                doctorController.findDoctor(formData.id_doctor).then(doctors=>{
                                    const html = data.toString().replace("<!--DOCTOR_DATA-->", JSON.stringify(doctors))
                                    .replace("<!--PATIENT_DATA-->", JSON.stringify(pt));;
                                    res.writeHead(200, {"Content-Type":"text/html"});
                                    res.end(html);
                                });
                            })}
                        });
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                        alert("Anda tidak memiliki akses");
                        window.location.href = "/"; 
                    </script>`);
                }
            });
        });
    }

    // GET /profile
    else if (req.method === 'GET' && req.url === '/profile') {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(async (user) => {
                if (!user) {
                    res.writeHead(302, { Location: '/login' });
                    return res.end();
                }

                const patient = await patientController.getPatientByIdUser(userId);
                if (!patient) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    return res.end("Patient not found");
                }

                fs.readFile(path.join(__dirname, "views", "profile.html"), (err, data) => {
                    if (err) {
                        console.log("Gagal memanggil view");
                        res.writeHead(500, { "Content-Type": "text/plain" });
                        return res.end("Gagal mengambil view");
                    }
                    let dateObj = new Date(patient.date_of_birth)

                    let formattedDate = 
                dateObj.getDate() + '/' + 
                (dateObj.getMonth() + 1) + '/' + 
                dateObj.getFullYear();

                    let html = data.toString();
                    html = html
                        .replace("{{first_name}}", patient.first_name)
                        .replace("{{last_name}}", patient.last_name)
                        .replace("{{email}}", user.email)
                        .replace("{{phone_number}}", user.phone)
                        .replace("{{address}}", patient.address)
                        .replace("{{city_of_birth}}", patient.city_of_birth)
                        .replace("{{date_of_birth}}", formattedDate)
                        .replace("{{gender}}", patient.gender)
                        .replace("{{blood_type}}", patient.blood_type);
                    
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(html);
                });
            })
            .catch(err=>{
                console.error("Error fetching profile:", err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end("Internal server error");
            });
        });
    }

    // Optional: GET /profile_edit (serve the edit page)
    else if (req.method === 'GET' && req.url === '/profile/edit') {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(async (user) => {
                if (!user) {
                    res.writeHead(302, { Location: '/login' });
                    return res.end();
                }

                const patient = await patientController.getPatientByIdUser(userId);
                if (!patient) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    return res.end("Patient not found");
                }

                fs.readFile(path.join(__dirname, "views", "profile_edit.html"), (err, data) => {
                    if (err) {
                        console.log("Gagal memanggil view");
                        res.writeHead(500, { "Content-Type": "text/plain" });
                        return res.end("Gagal mengambil view");
                    }
                    const genderOptions = ["Male", "Female"]
                        .map(g => `<option value="${g}" ${g === patient.gender ? "selected" : ""}>${g}</option>`)
                        .join("");
                    const bloodTypeOptions = ["A+","A-","B+","B-","AB+","AB-",  "O+",  "O-"]
                        .map(bt => `<option value="${bt}" ${bt === patient.blood_type ? "selected" : ""}>${bt}</option>`)
                        .join("");

                    let html = data.toString()
                        .replace("{{first_name}}", patient.first_name || "")
                        .replace("{{last_name}}", patient.last_name || "")
                        .replace("{{email}}", user.email || "")
                        .replace("{{phone_number}}", user.phone || "")
                        .replace("{{address}}", patient.address || "")
                        .replace("{{city_of_birth}}", patient.city_of_birth || "")
                        .replace("{{date_of_birth}}", patient.date_of_birth ? new Date(patient.date_of_birth).toISOString().split("T")[0]: "")
                        .replace("{{genderOptions}}", genderOptions)
                        .replace("{{bloodTypeOptions}}", bloodTypeOptions);

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(html);
                });
            })
            .catch(err=>{
                console.error("Error fetching profile edit page:", err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end("Internal server error");
            });
        });
    }

    else if (req.method === 'POST' && req.url === '/profile/edit') {
        auth.requireLogin(req, res, async (userId) => {
            try {
                let body = "";
                req.on("data", chunk => { body += chunk.toString(); });
                req.on("end", async () => {
                    const formData = new URLSearchParams(body);
                    if(  !formData.get("first_name") || !formData.get("last_name") ||  !formData.get("email") ||  !formData.get("phone_number") ||  !formData.get("address") ||  !formData.get("city_of_birth") ||  !formData.get("date_of_birth") ||  !formData.get("gender") ||  !formData.get("blood_type"))
                        {
                        res.writeHead(400, {"Content-Type": "text/plain"});
                        return res.end("Error: Semua harus diisi!");
                    } 
                    const dob = new Date(formData.get("date_of_birth"));

                    const today = new Date();
                    const minDate = new Date();
                    minDate.setFullYear(today.getFullYear() - 12);
                    if (dob > minDate) {
                        res.writeHead(403, { "Content-Type": "text/html"});
                        res.end(`
                            <script>
                                alert("Pasien yang bisa mendaftar adalah 12 tahun");
                                window.location.href = "/profile/edit"; 
                            </script>`
                        );
                        return;
                    }

                    const updatesUser = {
                        email: formData.get("email"),
                        phone: formData.get("phone_number")
                    };
                    const updatesPatient = {
                        first_name: formData.get("first_name"),
                        last_name: formData.get("last_name"),
                        address: formData.get("address"),
                        city_of_birth: formData.get("city_of_birth"),
                        date_of_birth: formData.get("date_of_birth"),
                        gender: formData.get("gender"),
                        blood_type: formData.get("blood_type")
                    };

                    // Update the user table
                    await userController.updateUser(userId, updatesUser);

                    // Find the related patient
                    const patient = await patientController.getPatientByIdUser(userId);
                    if (patient) {
                        await patientController.updatePatient(patient.id_patient, updatesPatient);
                    }

                    res.writeHead(302, { Location: '/profile' });
                    res.end();
                });
            } catch (err) {
                console.error("Error updating profile:", err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end("Failed to update profile");
            }
        });
    }


    else if (req.method === "POST" && req.url === "/profile/delete") {
        auth.requireLogin(req, res, async (userId) => {
            try {
                // Find patient linked to this user
                const patient = await patientController.getPatientByIdUser(userId);

                // Step 1: If patient exists, delete patient record first
                if (patient) {
                    const deleted = await patientController.deletePatient(patient.id_patient);
                    if (!deleted) {
                        res.writeHead(400, { "Content-Type": "text/plain" });
                        return res.end("Cannot delete account — there are still appointments linked to this patient.");
                    }
                }

                // Step 2: Delete the user account itself
                const success = await userController.deleteUser(userId);
                if (!success) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    return res.end("Failed to delete user account.");
                }

                // Step 3: Logout (clear cookie) and redirect
                res.writeHead(302, {
                    "Set-Cookie": "userId=; HttpOnly; Max-Age=0",
                    "Location": "/login"
                });
                res.end();

            } catch (err) {
                console.error("Error deleting account:", err);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
            }
        });
    }

    // KODE CREATE APPOINTMENT
    else if(req.url  === "/createappointment" && req.method === "POST"){
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "patient") {
                    let body = "";
                    req.on("data", chunk => {
                        body += chunk.toString();
                    });
                    req.on("end", ()=>{
                        const formData = querystring.parse(body);
                        console.log(body);
                        if(!formData.id_doctor || !formData.id_patient || !formData.appointment_date ||!formData.appointment_time){
                            res.writeHead(400, {"Content-Type": "text/plain"});
                            return res.end("Error: Semua harus diisi!");
                        }
                        const appointmentDate = new Date(formData.appointment_date);

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const minDate = new Date(today);
                        minDate.setDate(today.getDate() + 1);

                        if (appointmentDate < minDate) {
                            res.writeHead(403, { "Content-Type": "text/html" });
                            res.end(`
                                <script>
                                    alert("harus janjian minimal satu hari sebelumnya");
                                    window.location.href = "/doctors"; 
                                </script>
                            `);
                            return;
                        }

                        try{
                            appointmentController.createAppointment(formData).then(apt =>{
                                if (!apt) {  
                                    res.writeHead(200, { "Content-Type": "text/html" });
                                    res.end(`<script>
                                        alert("Antrian sudah penuh");
                                        window.location.href = "/appointmentlist"; 
                                    </script>`);
                                } else {
                                    res.writeHead(302, {"Location" : "/appointmentlist"});
                                    res.end();    
                                } 
                            });
                        }
                        catch(err){
                            console.log("Gagal memasukkan data");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal memasukkan data");
                        }
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`);
                }
            });
        });
    }

    // KODE GET APPOINTMENT LIST
    else if (req.url  === "/appointmentlist" && req.method === "GET") {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "patient"){
                    fs.readFile(path.join(__dirname, "views", "appointmentList.html"), (err, data) => {
                        if (err) {
                            console.log("Gagal memanggil view");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal mengambil view");
                        } 
                        else {
                            try{
                                const cookies = auth.parseCookies(req);
                                const userId = cookies.userId;
                                patientController.getPatientByIdUser(userId).then(pt=>{
                                    appointmentController.getAllSchedule(pt.id_patient).then(apt=>{
                                        const html = data.toString().replace("<!--APPOINTMENT_DATA-->", JSON.stringify(apt));
                                        res.writeHead(200, {"Content-Type":"text/html"});
                                        res.write(html);
                                    });
                                })
                            }
                            catch(err){
                                console.log("Gagal memanggil data");
                                res.writeHead(500, {"Content-Type":"text/plain"});
                                res.end("Gagal mengambil data");
                            }
                                
                        }
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                        alert("Anda tidak memiliki akses");
                        window.location.href = "/"; 
                    </script>`);
                }
            });
        });
    }

    // KODE DELETE APPOINTMENT
    else if (urlsplit[2] === "delete" && urlsplit[1] === "appointmentlist" && req.method === "GET") {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "patient"){
                    const id = urlsplit[3]; 
                    try{
                        appointmentController.deleteSchedule(id).then(apt =>{
                            // console.log(apt);
                            res.writeHead(302, {"Location" : "/appointmentlist"});
                            res.end();
                        });
                    }
                    catch(err){
                        console.log("Gagal memasukkan data");
                        res.writeHead(500, {"Content-Type":"text/plain"});
                        res.end("Gagal memasukkan data");
                    }
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`);
                }
            });
        });
    }

    // KODE TAMPILAN MEDICAL RECORD
    else if (req.url === "/medicalrecord" && req.method === "GET") {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user => {
                if (user.role === "patient") {
                    fs.readFile(path.join(__dirname, "views", "medicalRecord.html"), "utf8", (err, data) => {
                        if (err) {
                            console.log("Gagal memanggil view");
                            res.writeHead(500, { "Content-Type": "text/plain" });
                            res.end("Gagal mengambil view");
                            return;
                        }

                        const cookies = auth.parseCookies(req);
                        const userId = cookies.userId;

                        patientController.getPatientByIdUser(userId).then(pt => {
                            recordController.getAllRecord(pt.id_patient).then(records => {
                                let rows = "";
                                let i = 0;
                                records.forEach(rec => {
                                    i++;
                                    const doctor = rec.Appointment?.Doctor;
                                    const doctorName = doctor ? `${doctor.first_name} ${doctor.last_name}` : "Unknown";
                                    const degree = doctor?.degree ? `, ${doctor.degree}` : "";

                                    rows += `
                                    <tr>
                                        <th scope="row">${i}</th>
                                        <td>${rec.id_appointment}</td>
                                        <td>${rec.diagnosis || "coming soon at UAS"}</td>
                                        <td>${rec.prescription || "Coming soon at UAS"}</td>
                                        <td>${rec.doctor_note || "Coming soon at UAS"}</td>
                                        <td>${rec.Appointment?.appointment_date || "-"}</td>
                                        <td>${doctorName}${degree}</td>
                                    </tr>
                                    `;
                                });

                                // inject the generated rows into HTML
                                const html = data.replace("<!--RECORD_ROWS-->", rows);

                                res.writeHead(200, { "Content-Type": "text/html" });
                                res.end(html);
                            }).catch(err => {
                                console.error(err);
                                res.writeHead(500, { "Content-Type": "text/plain" });
                                res.end("Gagal mengambil data rekam medis");
                            });
                        }).catch(err => {
                            console.error(err);
                            res.writeHead(500, { "Content-Type": "text/plain" });
                            res.end("Gagal mengambil data pasien");
                        });
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html" });
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`);
                }
            });
        });
    }

    // KODE TAMPILAN CATEGORY
    else if(req.url  === "/admincategory" && req.method === "GET"){
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "admin"){
                    fs.readFile(path.join(__dirname, "views/admin", "adminCategory.html"), (err, data) => {
                        if (err) {
                            console.log("Gagal memanggil view");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal mengambil view");
                        } 
                        else {
                            try{    
                                categoryController.getAllCategory().then(categories=>{
                                    const html = data.toString().replace("<!--CATEGORY_DATA-->", JSON.stringify(categories));
                                    res.writeHead(200, {"Content-Type":"text/html"});
                                    res.end(html);
                                });
                            }
                            catch(err){
                                console.log("Gagal memanggil data");
                                res.writeHead(500, {"Content-Type":"text/plain"});
                                res.end("Gagal mengambil data");
                            }
                        }
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`);
                }
            });
        });
    }

    // KODE CREATE CATEGORY
    else if(req.url  === "/admincategory" && req.method === "POST"){
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "admin"){
                    let body = "";
                    req.on("data", chunk => {
                        body += chunk.toString();
                    });
                    req.on("end", ()=>{
                        const formData = querystring.parse(body);
                        console.log(body);
                        if(!formData.name){
                            res.writeHead(400, {"Content-Type": "text/plain"});
                            return res.end("Error: Semua harus diisi!");
                        }
                        try{
                            categoryController.createCategory(formData).then(apt =>{
                                // console.log(apt);
                                if (!apt) {  
                                    res.writeHead(200, { "Content-Type": "text/html" });
                                    res.end(`
                                        <script>
                                            alert("Category sudah ada");
                                            window.location.href = "/admincategory"; 
                                        </script>`);
                                }else{
                                    res.writeHead(302, { Location: '/admincategory' });
                                    res.end();    
                                }
                            });        
                        } catch(err) {
                            console.log("Gagal memasukkan data");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal memasukkan data");
                        }
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`);
                }
            });
        });
    }

     // KODE DELETE CATEGORY
    else if (urlsplit[2] === "delete" && urlsplit[1] === "admincategory" && req.method === "GET") {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "admin"){
                    const id = urlsplit[3]; 
                    try{
                        categoryController.deleteCategory(id).then(apt =>{
                            console.log(apt);
                            if(apt === false){
                                res.writeHead(200,  { "Content-Type": "text/html"});
                                res.end(`
                                    <script>
                                        alert("Ada dokter dengan bidang ini");
                                        window.location.href = "/admincategory"; 
                                    </script>`);
                            } else {
                                res.writeHead(302, {"Location" : "/admincategory"});
                                res.end();
                            }
                        });
                    } catch(err) {
                        console.log("Gagal memasukkan data");
                        res.writeHead(500, {"Content-Type":"text/plain"});
                        res.end("Gagal memasukkan data");
                    }
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`);
                }
            });
        });
    }

    // tampilkan admin appointment
    else if(req.url  === "/adminappointment" && req.method === "GET"){
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "admin"){
                    fs.readFile(path.join(__dirname, "views/admin", "adminAppointment.html"), (err, data) => {
                        if (err) {
                            console.log("Gagal memanggil view");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal mengambil view");
                        } else {
                            try{
                                appointmentController.adminGetAllSchedule().then(apt=>{
                                    const html = data.toString().replace("<!--APPOINTMENT_DATA-->", JSON.stringify(apt));
                                    res.writeHead(200, {"Content-Type":"text/html"});
                                    res.end(html);
                                });
                            }
                            catch(err){
                                console.log("Gagal memanggil data");
                                res.writeHead(500, {"Content-Type":"text/plain"});
                                res.end("Gagal mengambil data");
                            }
                                
                        }
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`);
                }
            });
        });
    }

// update appointment
    else if(req.url  === "/adminappointment" && req.method === "POST"){
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "admin"){
                    let body = "";
                    req.on("data", chunk => {
                        body += chunk.toString();
                    });
                    req.on("end", ()=>{
                        const formData = querystring.parse(body);            
                        try{
                            appointmentController.updateStatus(formData).then(apt =>{
                                // console.log(apt);
                                res.writeHead(302, {"Location" : "/adminappointment"});
                                res.end();
                            });
                        }
                        catch(err){
                            console.log("Gagal memasukkan data");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal memasukkan data");
                        }
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`);
                }
            });
        });
    }

     else if(req.url  === "/admindoctor" && req.method === "GET"){
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "admin"){
                   fs.readFile(path.join(__dirname, "views/admin", "adminDoctor.html"), (err, data) => {
                        if (err) {
                            console.log("Gagal memanggil view");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal mengambil view");
                        } 
                        else {
                            try{
                                doctorController.getAllDoctor().then(doctors=>{
                                    categoryController.getAllCategory().then(categories=>{
                                        const html = data.toString().replace("<!--DOCTOR_DATA-->", JSON.stringify(doctors))
                                        .replace("<!--CATEGORY_DATA-->", JSON.stringify(categories));
                                        res.writeHead(200, {"Content-Type":"text/html"});
                                        res.end(html);
                                    })
                                
                                });
                                }
                            catch(err){
                                console.log("Gagal memanggil data");
                                res.writeHead(500, {"Content-Type":"text/plain"});
                                res.end(err + "Gagal mengambil data");
                            }
                        }
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`);
                }
            });
        });
    }

   // KODE CREATE APPOINTMENT
    else if(req.url  === "/admindoctor" && req.method === "POST"){
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "admin"){
                    let body = "";
                    req.on("data", chunk => {
                        body += chunk.toString();
                    });
                    req.on("end", ()=>{
                        const formData = querystring.parse(body);
                        console.log(body);
                        if(formData.category === "default" || !formData.first_name || !formData.last_name ||!formData.experience || !formData.gender ||!formData.degree){
                            res.writeHead(400, {"Content-Type": "text/plain"});
                            return res.end("Error: Semua harus diisi!");
                        }
                        try{
                            userController.createUserDoctor(formData).then(apt =>{
                                console.log(apt);
                                res.writeHead(302, {"Location" : "/admindoctor"});
                                res.end();  
                            });
                            
                        }
                        catch(err){
                            console.log("Gagal memasukkan data");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal memasukkan data");
                        }
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`);
                }
            });
        });
    }

    // update admindoctor
    else if(req.url  === "/updateadmindoctor" && req.method === "POST") {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=> {
                if(user.role === "admin") {
                    let body = "";
                    req.on("data", chunk => {
                        body += chunk.toString();
                    });
                    req.on("end", ()=> {
                        const formData = querystring.parse(body);
                        if(formData.category === "default" || !formData.first_name || !formData.last_name ||!formData.experience || !formData.gender ||!formData.degree) {
                            res.writeHead(400, {"Content-Type": "text/plain"});
                            return res.end("Error: Semua harus diisi!");
                        }
                        try {
                            doctorController.updateDoctor(formData).then(apt => {
                                res.writeHead(302, {"Location" : "/admindoctor"});
                                res.end();
                            });

                        }
                        catch(err) {
                            console.log("Gagal memasukkan data");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal memasukkan data");
                        }
                    });
                }
                else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                            <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/";
                            </script>`);
                }
            });
        });
    }

    // delete admin doctor
    else if (urlsplit[2] === "delete" && urlsplit[1] === "admindoctor" && req.method === "GET") {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=> {
                if(user.role === "admin") {
                    const id = urlsplit[3];
                    try {
                        doctorController.deleteDoctor(id).then(apt => {
                            // console.log(apt);
                            if(apt === false) {
                                res.writeHead(200,  { "Content-Type": "text/html"});

                                res.end(`
                                        <script>
                                            alert("Dokter masih aktif");
                                            window.location.href = "/admindoctor";
                                        </script>`);
                            }
                            else {
                                res.writeHead(302, {"Location" : "/admindoctor"});
                                res.end();

                            }
                        });

                    }
                    catch(err) {
                        console.log("Gagal memasukkan data");
                        res.writeHead(500, {"Content-Type":"text/plain"});
                        res.end("Gagal memasukkan data");
                    }
                }
                else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                            <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/";
                            </script>`);
                }
            });
        });
    }
    // tampilan adminpatient
    else if(req.url  === "/adminpatient" && req.method === "GET") {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=> {
                if(user.role === "admin") {
                    fs.readFile(path.join(__dirname, "views/admin", "adminPatient.html"), (err, data) => {
                        if (err) {
                            console.log("Gagal memanggil view");
                            res.writeHead(500, {"Content-Type":"text/plain"});
                            res.end("Gagal mengambil view");
                        }
                        else {
                            try {


                                patientController.getAllPatient().then(pt=> {
                                    const html = data.toString().replace("<!--PATIENT_DATA-->", JSON.stringify(pt))
                                                res.writeHead(200, {"Content-Type":"text/html"});
                                    res.end(html);
                                })


                            }
                            catch(err) {
                                console.log("Gagal memanggil data");
                                res.writeHead(500, {"Content-Type":"text/plain"});
                                res.end("Gagal mengambil data");
                            }
                        }
                    });
                }
                else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                            <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/";
                            </script>`);
                }
            });
        });
    }

     // KODE CREATE adminpatient
    else if(req.url  === "/adminpatient" && req.method === "POST"){
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "admin"){
                    let body = "";
                    req.on("data", chunk => {
                        body += chunk.toString();
                    });
                    req.on("end", ()=>{
                        const formData = querystring.parse(body);
                        console.log(body);
                        if(!formData.city_of_birth || !formData.date_of_birth || !formData.address ||  !formData.first_name || !formData.last_name  || !formData.gender || !formData.blood_type || !formData.condition){
                            res.writeHead(400, {"Content-Type": "text/plain"});
                            return res.end("Error: Semua harus diisi!");
                    }  const dob = new Date(formData.date_of_birth);

                    const today = new Date();
                    const minDate = new Date();
                    minDate.setFullYear(today.getFullYear() - 12);
                    if (dob > minDate) {
                        res.writeHead(403, { "Content-Type": "text/html"});
                        res.end(`
                            <script>
                                alert("Pasien yang bisa mendaftar adalah 12 tahun");
                                window.location.href = "/adminpatient"; 
                            </script>`
                        );
                        return;
                    }
                        try{
                            userController.createUserPatient(formData).then(apt =>{
                                console.log(apt);
                                    res.writeHead(302, {"Location" : "/adminpatient"});
                                    res.end();
                            });
                            
                        }
                        catch(err){
                                console.log("Gagal memasukkan data");
                                    res.writeHead(500, {"Content-Type":"text/plain"});
                                    res.end("Gagal memasukkan data");
                        }
                    });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                        alert("Anda tidak memiliki akses");
                        window.location.href = "/"; 
                    </script>`);
                }
            });
        });
    }

    // update admin patient
    else if(req.url  === "/updateadminpatient" && req.method === "POST"){
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "admin"){
                    let body = "";
                    req.on("data", chunk => {
                        body += chunk.toString();
                    });
                    req.on("end", ()=>{
                    const formData = querystring.parse(body);
                    if(!formData.city_of_birth || !formData.date_of_birth || !formData.address ||  !formData.first_name || !formData.last_name  || !formData.gender || !formData.blood_type || !formData.condition){
                            res.writeHead(400, {"Content-Type": "text/plain"});
                            return res.end("Error: Semua harus diisi!");
                    }  
                     const dob = new Date(formData.date_of_birth);

                    const today = new Date();
                    const minDate = new Date();
                    minDate.setFullYear(today.getFullYear() - 12);
                    if (dob > minDate) {
                        res.writeHead(403, { "Content-Type": "text/html"});
                        res.end(`
                            <script>
                                alert("Pasien yang bisa mendaftar adalah 12 tahun");
                                window.location.href = "/adminpatient"; 
                            </script>`
                        );
                        return;
                    }        
                    try{
                        patientController.updatePatient(formData.id_patient, formData).then(apt =>{
                            res.writeHead(302, {"Location" : "/adminpatient"});
                            res.end();    
                        });
                    }
                    catch(err){
                        console.log("Gagal memasukkan data");
                        res.writeHead(500, {"Content-Type":"text/plain"});
                        res.end("Gagal memasukkan data");
                    }
                });
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`);
                }
            });
        });
    }

    // delete adminpatient
    else if (urlsplit[2] === "delete" && urlsplit[1] === "adminpatient" && req.method === "GET") {
        auth.requireLogin(req, res, (userId) => {
            userController.findById(userId).then(user=>{
                if(user.role === "admin"){
                    const id = urlsplit[3]; 
                    try{
                        patientController.deletePatient(id).then(apt =>{
                            if(apt === false){
                                res.writeHead(200,  { "Content-Type": "text/html"});
                                res.end(`
                                <script>
                                    alert("Pasien masih aktif");
                                    window.location.href = "/adminpatient"; 
                                </script>`);
                            } else {
                                res.writeHead(302, {"Location" : "/adminpatient"});
                                res.end();
                            }
                        });
                    } catch(err){
                        console.log("Gagal memasukkan data");
                        res.writeHead(500, {"Content-Type":"text/plain"});
                        res.end("Gagal memasukkan data");
                    }
                } else {
                    res.writeHead(403, { "Content-Type": "text/html"});
                    res.end(`
                        <script>
                            alert("Anda tidak memiliki akses");
                            window.location.href = "/"; 
                        </script>`
                    );
                }
            });
        });
    }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});