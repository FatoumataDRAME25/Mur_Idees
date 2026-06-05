
import {createClient} from "@supabase/supabase-js"

const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabase = createClient(supabaseUrl, supabaseKey)




export async function recupererIdees() {
    const { data, error } = await supabase
    .from('Idees')
    .select('*')
    
    if (error) {
        console.error(error);
        
    }
    return data
}


export async function updateIdees(id,idee) {
    const {error} = await supabase
    .from('Idees')
    .update([idee])
    .eq('id', id)
}

export async function createIdees(idee) {
    const {data,error} = await supabase
    .from('Idees')
    .insert([idee]);
}


export async function deleteIdees(id) {
    const { error } = await supabase
    .from('Idees')
    .delete()
    .eq('id', id)
}