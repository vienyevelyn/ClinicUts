const Doctor = require("../models/doctor");
const Patient = require("../models/patient");
const Appointment = require("../models/appointment");
const Record = require("../models/medical_record");

async function getAllSchedule(idPK) {
    try{
        const apt = await Appointment.findAll({
            include: Doctor,
            where: {
                id_patient: idPK,
                status: "SCHEDULE"
            }
        });
        return apt;
    }
    catch(err){
        throw err;
    }
}

async function deleteSchedule(idPK){
    try{
        await Appointment.destroy({
            where: {
                id_appointment: idPK
            }
        });

        return true
    }
    catch(err){
        throw err;
    }
}

async function deleteByDoctor(id_doctor) {
    try {
        await Appointment.destroy({ where: { id_doctor } });
    } catch (err) {
        throw err;
    }
}


async function createAppointment(data){
    try{
        let id = "";
        const checkempty = await Appointment.findAndCountAll();
        console.log(checkempty);

        if(checkempty.count <= 0){
            id = "AP001";
        }
       
        else{
            const checkdata = await Appointment.findAndCountAll({
                where: {
                        id_doctor: data.id_doctor,
                        appointment_date: data.appointment_date,
                        status: "SCHEDULE"
                    }
                });

                if(checkdata.count >= 10){
                    return null;
                }else{
                    const last = await Appointment.findOne({
                        order: [["id_appointment", "DESC"]]
                });
                const newNum = parseInt(last.id_appointment.slice(2), 10) + 1;
                id = "AP" + String(newNum).padStart(3, '0');
                
            }
        }
        const appointmentLast = await Appointment.findOne({
            where: {
                appointment_date: data.appointment_date,
                id_doctor: data.id_doctor,
            },
            order: [["queue", "DESC"]],
        })

        let Nqueue = appointmentLast ? appointmentLast.queue + 1 : 1;
        let keluhan = data.patient_note || "-";

        const apt = await Appointment.create({
            id_appointment : id,
            id_doctor : data.id_doctor,
            id_patient : data.id_patient,
            queue : Nqueue,
            appointment_date : data.appointment_date,
            appointment_time : data.appointment_time,
            patient_note: keluhan,
            status : "SCHEDULE",
        });
        return apt;
    }
    catch(err){
        throw err;
    }
}

async function adminGetAllSchedule(){
     try{
        const apt = await Appointment.findAll({
            include:  [Doctor,Patient],
            order: [["last_updated_at", "DESC"]]
        });
        return apt;
    }
    catch(err){
        throw err;
    }
}

async function updateStatus(data) {
    try{
        const updated = await Appointment.update({
            status: data.status,
            last_updated_at: new Date()
        },
        {
            where: {
                id_appointment: data.id_appointment
            },
        });

        if (data.status === "FINISHED") {
            const apt = await Appointment.findOne({
                where: { id_appointment: data.id_appointment },
            });

            if (apt) {
                const count = await Record.count();
                const newId = "MR" + String(count + 1).padStart(3, "0");

                await Record.create({
                    id_record: newId,
                    id_patient: apt.id_patient,
                    id_appointment: apt.id_appointment,
                    diagnosis: data.diagnosis || "-",
                    prescription: data.prescription || "-",
                    doctor_note: data.doctor_note || "-",
                    created_at: new Date(),
                    last_updated_at: new Date(),
                });
            }
        }

        return updated;

    }
    catch(err){
        throw err;
    }
}

async function activeAppointment(id_doctors) {
    try {
        const doctor = await Appointment.findOne({
            where: {
                id_doctor: id_doctors,
                status: "SCHEDULE"
            }
        })
        if(doctor){
            return true;
        }
        else{
            return false
        }
    }
    catch(err){
        throw err;
    }
}

async function haveAppointment(id_patients) {
    try {
        const patient = await Appointment.findOne({
            where: {
                id_patient: id_patients,
            }
        })
        if(patient){
            return true;
        }
        else{
            return false
        }
    }
    catch(err){
        throw err;
    }
}
module.exports = {createAppointment, getAllSchedule, deleteSchedule, adminGetAllSchedule, updateStatus, activeAppointment, haveAppointment, deleteByDoctor}