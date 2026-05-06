using BankAudit.API.Entities;
using BankAudit.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await EnsureSchemaAsync(context);

        if (!context.Users.Any(u => u.Role == UserRole.Operator))
        {
            context.Users.Add(new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                FullName = "System Administrator",
                Role = UserRole.Operator,
                Email = "admin@bankaudit.com",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        if (!context.Branches.Any())
        {
            var branches = new List<Branch>
            {
                new() { BranchCode = "001", BranchName = "Principal Branch" },
                new() { BranchCode = "002", BranchName = "Khatungonj" },
                new() { BranchCode = "003", BranchName = "MOULAVIBAZAR(DHK) BRANCH" },
                new() { BranchCode = "004", BranchName = "Agrabad" },
                new() { BranchCode = "005", BranchName = "Zinzira" },
                new() { BranchCode = "006", BranchName = "Sylhet" },
                new() { BranchCode = "007", BranchName = "Bogura Branch" },
                new() { BranchCode = "008", BranchName = "Islampur Branch" },
                new() { BranchCode = "009", BranchName = "Hasnabad Branch" },
                new() { BranchCode = "010", BranchName = "Mymensingh" },
                new() { BranchCode = "011", BranchName = "Narsingdi Branch" },
                new() { BranchCode = "012", BranchName = "Dinajpur Branch" },
                new() { BranchCode = "013", BranchName = "Moulvibazar (Sylhet)" },
                new() { BranchCode = "014", BranchName = "Biswanath" },
                new() { BranchCode = "015", BranchName = "Beanibazar" },
                new() { BranchCode = "016", BranchName = "Khulna" },
                new() { BranchCode = "017", BranchName = "Elephant Road" },
                new() { BranchCode = "018", BranchName = "Cox'sBazar" },
                new() { BranchCode = "019", BranchName = "Chowmuhani Branch" },
                new() { BranchCode = "020", BranchName = "Madunaghat" },
                new() { BranchCode = "021", BranchName = "Noapara" },
                new() { BranchCode = "022", BranchName = "Rangpur" },
                new() { BranchCode = "023", BranchName = "Jubilee Road Br" },
                new() { BranchCode = "024", BranchName = "Shantinagar Branch" },
                new() { BranchCode = "025", BranchName = "Bangshal" },
                new() { BranchCode = "026", BranchName = "Rajshahi" },
                new() { BranchCode = "027", BranchName = "Naogaon" },
                new() { BranchCode = "028", BranchName = "Nowabpur" },
                new() { BranchCode = "029", BranchName = "Cumilla" },
                new() { BranchCode = "030", BranchName = "Kadamtali" },
                new() { BranchCode = "031", BranchName = "Chawkbazar" },
                new() { BranchCode = "032", BranchName = "Barisal" },
                new() { BranchCode = "033", BranchName = "Narayanganj" },
                new() { BranchCode = "034", BranchName = "Amborkhana Branch" },
                new() { BranchCode = "035", BranchName = "Pabna Branch" },
                new() { BranchCode = "036", BranchName = "Chandpur" },
                new() { BranchCode = "037", BranchName = "Jessore" },
                new() { BranchCode = "038", BranchName = "Kushtia Branch" },
                new() { BranchCode = "039", BranchName = "Tangail" },
                new() { BranchCode = "040", BranchName = "LOHAGARA" },
                new() { BranchCode = "041", BranchName = "Nazirhat" },
                new() { BranchCode = "042", BranchName = "Serajganj Branch" },
                new() { BranchCode = "043", BranchName = "Lakshmipur Branch" },
                new() { BranchCode = "044", BranchName = "Kawranbazar" },
                new() { BranchCode = "045", BranchName = "Jhenaidah" },
                new() { BranchCode = "046", BranchName = "Brahmanbaria Branch" },
                new() { BranchCode = "047", BranchName = "Goalabazar" },
                new() { BranchCode = "048", BranchName = "Sherpur Branch (Sylhet)" },
                new() { BranchCode = "049", BranchName = "Port Branch" },
                new() { BranchCode = "050", BranchName = "Mohammadpur" },
                new() { BranchCode = "051", BranchName = "Shibgonj" },
                new() { BranchCode = "052", BranchName = "Anderkilla Branch" },
                new() { BranchCode = "053", BranchName = "Nayabazar" },
                new() { BranchCode = "054", BranchName = "Gulshan" },
                new() { BranchCode = "055", BranchName = "Paglabazar" },
                new() { BranchCode = "056", BranchName = "Mirpur Branch" },
                new() { BranchCode = "057", BranchName = "Maizdee Court" },
                new() { BranchCode = "058", BranchName = "O.R Nizam Road Branch" },
                new() { BranchCode = "059", BranchName = "Noapara Bazar Branch" },
                new() { BranchCode = "060", BranchName = "Natore" },
                new() { BranchCode = "061", BranchName = "Khan Jahan Ali Road Branch" },
                new() { BranchCode = "062", BranchName = "Chapainawabgonj" },
                new() { BranchCode = "063", BranchName = "Zinda Bazar" },
                new() { BranchCode = "064", BranchName = "Nabigonj Branch" },
                new() { BranchCode = "065", BranchName = "Kamalbazar" },
                new() { BranchCode = "066", BranchName = "Chuadanga" },
                new() { BranchCode = "067", BranchName = "MADHABDI" },
                new() { BranchCode = "068", BranchName = "Fatickchari Branch" },
                new() { BranchCode = "069", BranchName = "Faridpur Branch" },
                new() { BranchCode = "070", BranchName = "Tongi Branch" },
                new() { BranchCode = "071", BranchName = "Barolekha Br" },
                new() { BranchCode = "072", BranchName = "Foreign Exchange" },
                new() { BranchCode = "073", BranchName = "FENI" },
                new() { BranchCode = "074", BranchName = "Dohazari" },
                new() { BranchCode = "075", BranchName = "North Brook Hall Road" },
                new() { BranchCode = "076", BranchName = "MURADPUR" },
                new() { BranchCode = "077", BranchName = "Station Road Branch" },
                new() { BranchCode = "078", BranchName = "Mohakhali" },
                new() { BranchCode = "079", BranchName = "Bahaddarhat Branch" },
                new() { BranchCode = "080", BranchName = "BHULTA" },
                new() { BranchCode = "081", BranchName = "Gohira" },
                new() { BranchCode = "082", BranchName = "Chokoria" },
                new() { BranchCode = "083", BranchName = "Uttara" },
                new() { BranchCode = "084", BranchName = "Dhanmondi Branch" },
                new() { BranchCode = "085", BranchName = "Shahjalal Upashahar Branch" },
                new() { BranchCode = "086", BranchName = "Gazipur Chowrasta" },
                new() { BranchCode = "087", BranchName = "Donia" },
                new() { BranchCode = "088", BranchName = "Hathazari Branch" },
                new() { BranchCode = "089", BranchName = "Rangunia" },
                new() { BranchCode = "090", BranchName = "Banani" },
                new() { BranchCode = "091", BranchName = "Savar" },
                new() { BranchCode = "092", BranchName = "Nabinagar" },
                new() { BranchCode = "093", BranchName = "Chashara" },
                new() { BranchCode = "094", BranchName = "New Eskaton" },
                new() { BranchCode = "095", BranchName = "Corporate" },
                new() { BranchCode = "096", BranchName = "Eidgaon" },
                new() { BranchCode = "097", BranchName = "Pahartali" },
                new() { BranchCode = "098", BranchName = "Lamabazar name" },
                new() { BranchCode = "099", BranchName = "Bashundhara Branch" },
                new() { BranchCode = "100", BranchName = "Kanchan Branch" },
                new() { BranchCode = "101", BranchName = "Dampara" },
                new() { BranchCode = "102", BranchName = "Satoire Bazar" },
                new() { BranchCode = "103", BranchName = "Raozan SME/Krishi" },
                new() { BranchCode = "104", BranchName = "Tejgaon" },
                new() { BranchCode = "105", BranchName = "Sonargoan Janapath" },
                new() { BranchCode = "106", BranchName = "Mawna" },
                new() { BranchCode = "107", BranchName = "Bijaynagar Branch" },
                new() { BranchCode = "108", BranchName = "GOPALGONJ BRANCH" },
                new() { BranchCode = "109", BranchName = "RAJBARI" },
                new() { BranchCode = "110", BranchName = "Tongi Station Road" },
                new() { BranchCode = "111", BranchName = "Chaturi" },
                new() { BranchCode = "112", BranchName = "Uttarkhan" },
                new() { BranchCode = "113", BranchName = "Pragati Sarani Branch" },
                new() { BranchCode = "114", BranchName = "Keranigonj" },
                new() { BranchCode = "115", BranchName = "Konabari" },
                new() { BranchCode = "116", BranchName = "Kanaipur" },
                new() { BranchCode = "117", BranchName = "HALISHAHAR BRANCH" },
                new() { BranchCode = "118", BranchName = "Subidbazar Branch" },
                new() { BranchCode = "119", BranchName = "Munshigonj" },
                new() { BranchCode = "120", BranchName = "Mirpur Road" },
                new() { BranchCode = "121", BranchName = "Sitakunda" },
                new() { BranchCode = "122", BranchName = "SATMASJID ROAD BRANCH" },
                new() { BranchCode = "123", BranchName = "Satarkul" },
                new() { BranchCode = "124", BranchName = "Shibchar" },
                new() { BranchCode = "125", BranchName = "Battali" },
                new() { BranchCode = "126", BranchName = "Banasree" },
                new() { BranchCode = "127", BranchName = "Enayet Bazar Branch" },
                new() { BranchCode = "128", BranchName = "Kamrangirchar Br" },
                new() { BranchCode = "129", BranchName = "Khilkhet" },
                new() { BranchCode = "130", BranchName = "Sarulia Bazar" },
                new() { BranchCode = "131", BranchName = "Azadi Bazar" },
                new() { BranchCode = "132", BranchName = "Chinispur" },
                new() { BranchCode = "133", BranchName = "Kapasia" },
                new() { BranchCode = "134", BranchName = "Kaligonj" },
                new() { BranchCode = "135", BranchName = "Sadarghat" },
                new() { BranchCode = "136", BranchName = "Jhawtala" },
                new() { BranchCode = "137", BranchName = "Kazirhat" },
                new() { BranchCode = "138", BranchName = "Darus Salam Road" },
                new() { BranchCode = "139", BranchName = "Baroiarhat" },
                new() { BranchCode = "140", BranchName = "Dakshinkhan" },
                new() { BranchCode = "141", BranchName = "Ullapara" },
                new() { BranchCode = "142", BranchName = "Ctg medical Branch" },
                new() { BranchCode = "143", BranchName = "Karnaphuli Branch" },
                new() { BranchCode = "144", BranchName = "Sonaimuri" },
                new() { BranchCode = "145", BranchName = "Bancharampur Branch" },
                new() { BranchCode = "146", BranchName = "Gausul Azam Avenue Branch" },
                new() { BranchCode = "147", BranchName = "Gopaldi" },
                new() { BranchCode = "148", BranchName = "Baneshwar" },
                new() { BranchCode = "149", BranchName = "CHOWDHURYHAT BRANCH" },
                new() { BranchCode = "150", BranchName = "Joypurhat" },
                new() { BranchCode = "151", BranchName = "Nikunja" },
                new() { BranchCode = "152", BranchName = "Meghnaghat Branch" },
                new() { BranchCode = "153", BranchName = "Kanchpur" },
                new() { BranchCode = "154", BranchName = "Bhawal Mirzapur Branch" },
                new() { BranchCode = "155", BranchName = "Sherpur" },
                new() { BranchCode = "156", BranchName = "BARAKANDI" },
                new() { BranchCode = "157", BranchName = "Ghatail Branch" },
                new() { BranchCode = "158", BranchName = "Katghar" },
                new() { BranchCode = "159", BranchName = "Bhola" },
                new() { BranchCode = "160", BranchName = "Khilgaon" },
                new() { BranchCode = "161", BranchName = "Enayetpur Branch" },
                new() { BranchCode = "162", BranchName = "Oxygen" },
                new() { BranchCode = "163", BranchName = "Bandarban" },
                new() { BranchCode = "164", BranchName = "Hemayetpur" },
                new() { BranchCode = "165", BranchName = "JOYDEBPUR" },
                new() { BranchCode = "166", BranchName = "Kamarapara" },
                new() { BranchCode = "167", BranchName = "Kulaura Branch" },
                new() { BranchCode = "168", BranchName = "Kasba" },
                new() { BranchCode = "169", BranchName = "Matuail Barnch" },
                new() { BranchCode = "170", BranchName = "Danga Bazar Branch" },
                new() { BranchCode = "171", BranchName = "Balasur" },
                new() { BranchCode = "172", BranchName = "Katiadi Branch" },
                new() { BranchCode = "173", BranchName = "Manikganj" },
                new() { BranchCode = "174", BranchName = "Chandanaish" },
                new() { BranchCode = "175", BranchName = "JAMAL KHAN BRANCH" },
                new() { BranchCode = "176", BranchName = "Anowara Sadar" },
                new() { BranchCode = "177", BranchName = "Patiya" },
                new() { BranchCode = "178", BranchName = "Ati Bazar" },
                new() { BranchCode = "179", BranchName = "Keranihat Branch" },
                new() { BranchCode = "180", BranchName = "Shyamoli Ring Road Branch" },
                new() { BranchCode = "181", BranchName = "Satkhira" },
                new() { BranchCode = "182", BranchName = "Nilphamari" },
                new() { BranchCode = "183", BranchName = "Boda" },
                new() { BranchCode = "184", BranchName = "Kala Meah Bazar" },
                new() { BranchCode = "185", BranchName = "Fakirhat" },
                new() { BranchCode = "186", BranchName = "SHARAFBHATA BR." },
                new() { BranchCode = "187", BranchName = "Kashinathpur" },
                new() { BranchCode = "188", BranchName = "Charfasson" },
                new() { BranchCode = "189", BranchName = "Kendua Branch" },
                new() { BranchCode = "190", BranchName = "Ekuria" },
                new() { BranchCode = "191", BranchName = "Shantirhat" },
                new() { BranchCode = "192", BranchName = "Boalkhali" },
                new() { BranchCode = "193", BranchName = "Madhabpur" },
                new() { BranchCode = "194", BranchName = "Khulshi" },
                new() { BranchCode = "195", BranchName = "NORTH GULSHAN" },
                new() { BranchCode = "196", BranchName = "Sandwip Branch" },
                new() { BranchCode = "197", BranchName = "Barguna" },
                new() { BranchCode = "198", BranchName = "Subidkhali Branch" },
                new() { BranchCode = "199", BranchName = "Thakurgaon" },
                new() { BranchCode = "200", BranchName = "Banani Road No 11" },
                new() { BranchCode = "201", BranchName = "SIGNBOARD BRANCH" },
                new() { BranchCode = "202", BranchName = "Shibu Market" },
                new() { BranchCode = "203", BranchName = "Bheramara Branch" },
                new() { BranchCode = "204", BranchName = "Jhalakathi" },
                new() { BranchCode = "205", BranchName = "Rangamati Branch" },
                new() { BranchCode = "206", BranchName = "Khagrachari" },
                new() { BranchCode = "207", BranchName = "Gaibandha" },
                new() { BranchCode = "208", BranchName = "Gangni" },
                new() { BranchCode = "209", BranchName = "Hatibandha" },
                new() { BranchCode = "210", BranchName = "Bhanga" },
                new() { BranchCode = "211", BranchName = "Arpara Branch" },
                new() { BranchCode = "212", BranchName = "Kafrul branch" },
                new() { BranchCode = "214", BranchName = "INDURHAT" },
                new() { BranchCode = "215", BranchName = "Derai" },
                new() { BranchCode = "216", BranchName = "Jamalpur" },
                new() { BranchCode = "217", BranchName = "Kurigram" },
                new() { BranchCode = "218", BranchName = "Muksudpur Branch" },
                new() { BranchCode = "219", BranchName = "Norosinghopur Branch" },
                new() { BranchCode = "220", BranchName = "Sreemangal" },
                new() { BranchCode = "221", BranchName = "Ghior" },
                new() { BranchCode = "222", BranchName = "Sadarpur" },
                new() { BranchCode = "223", BranchName = "Monohardi" },
                new() { BranchCode = "224", BranchName = "Bandartila" },
                new() { BranchCode = "225", BranchName = "Laksam Branch" },
                new() { BranchCode = "226", BranchName = "Matlab Uttar Branch" },
                new() { BranchCode = "227", BranchName = "Baroipara" },
                new() { BranchCode = "228", BranchName = "Master Bari" },
                new() { BranchCode = "229", BranchName = "TEKERHAT" },
                new() { BranchCode = "230", BranchName = "Mainamati" },
                new() { BranchCode = "231", BranchName = "Basurhat" },
                new() { BranchCode = "786", BranchName = "UCB TAQWA IB BRANCH" },
            };

            context.Branches.AddRange(branches);
            await context.SaveChangesAsync();
        }

        if (!context.ICCDEmployees.Any())
        {
            var employees = new List<ICCDEmployee>
            {
                // RBIA Wing - Audit
                new() { EmployeeId = "5486",  Name = "Rashedur Rahman",             Designation = "FVP",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "4555",  Name = "Md. Kalim Uddin Mozumder",    Designation = "FVP",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "4566",  Name = "Md. Anwar Hossain",           Designation = "FVP",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "3277",  Name = "Md. Ashraf Uddin Bhuiyan",    Designation = "FVP",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "3773",  Name = "Md. Shahidul Islam Mollah",   Designation = "FVP",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "3385",  Name = "Md. Faruk Hossain",           Designation = "FVP",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "3681",  Name = "Md. Abdur Rob Howlader",      Designation = "VP",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "2932",  Name = "Kazi Zahirul Islam",          Designation = "VP",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "4606",  Name = "Chapal Barua",                Designation = "VP",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "2458",  Name = "Ziaul Hasan Iftiar Mahbub",   Designation = "VP",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "5447",  Name = "Kazi Rakib Hossan",           Designation = "VP",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "3611",  Name = "Md. Kamal Hossain",           Designation = "VP",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "6875",  Name = "Mohammed Mohiuddin Biswas",   Designation = "VP",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "3535",  Name = "Abdul Ahad",                  Designation = "VP",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "4199",  Name = "Mahmudul Hasan",              Designation = "VP",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "2600",  Name = "Fatema-Tuj-Johura",           Designation = "VP",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "741",   Name = "Md. Saiful Kabir",            Designation = "FAVP", Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "7385",  Name = "Mohammad Anamul Haque",       Designation = "FAVP", Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "3609",  Name = "Md. Kamal Sarder",            Designation = "FAVP", Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "4200",  Name = "Rafiul Bari Khan",            Designation = "FAVP", Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "5873",  Name = "Sunnyeat Ismat Omith",        Designation = "FAVP", Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "4102",  Name = "Fahad Ahmed Bhuiyan",         Designation = "FAVP", Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "8072",  Name = "Mohammad Omar Faruque",       Designation = "FAVP", Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "3811",  Name = "Muhammad Mahbubur Rahman",    Designation = "FAVP", Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "4190",  Name = "S.M. Oly Ahad",               Designation = "FAVP", Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "8747",  Name = "Akram Uddin Majumder",        Designation = "AVP",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "5334",  Name = "Khandaker Abdul Muntashir",   Designation = "AVP",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "6048",  Name = "Md. Mehrab Khan",             Designation = "AVP",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "8731",  Name = "Ahmad Sayeed Russel",         Designation = "SEO",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "8739",  Name = "Md. Omar Faruk",              Designation = "SEO",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "8071",  Name = "Imtiaz Hossain",              Designation = "SEO",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "8678",  Name = "Feroz Hossain",               Designation = "SEO",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "10302", Name = "Ishtiaq Mahmud Emon",         Designation = "SEO",  Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "8750",  Name = "Kawsar Mohammad Farhad",      Designation = "EO",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "8741",  Name = "Kazi Shahriar Sonnet",        Designation = "EO",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "4052",  Name = "Aminul Islam",                Designation = "EO",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "6323",  Name = "Raihan Kabir",                Designation = "EO",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "6317",  Name = "Razib Khan",                  Designation = "EO",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "8751",  Name = "Md. Riaz Uddin",              Designation = "SO",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "8913",  Name = "Md. Mainuddin",               Designation = "SO",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "10274", Name = "Monir Ahammad Bhuiyan",       Designation = "SO",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "10301", Name = "Ashadus Jaman",               Designation = "SO",   Unit = "Audit",      Wing = "RBIA" },
                new() { EmployeeId = "8048",  Name = "Mahede Hasan Shaoun",         Designation = "JO",   Unit = "Audit",      Wing = "RBIA" },

                // FxAudit Wing - Audit
                new() { EmployeeId = "5438",  Name = "Md. Amirul Islam",            Designation = "VP",   Unit = "Audit",      Wing = "FxAudit" },
                new() { EmployeeId = "8745",  Name = "Lubana Rahman",               Designation = "SEO",  Unit = "Audit",      Wing = "FxAudit" },

                // Special Investigation Wing - Audit
                new() { EmployeeId = "3479",  Name = "Muhammad Abdul Awal",         Designation = "EO",   Unit = "Audit",      Wing = "Special Investigation" },
                new() { EmployeeId = "3270",  Name = "Wayes Ahmed",                 Designation = "EO",   Unit = "Audit",      Wing = "Special Investigation" },
                new() { EmployeeId = "5702",  Name = "Mezbaul Haider",              Designation = "SO",   Unit = "Audit",      Wing = "Special Investigation" },
                new() { EmployeeId = "5286",  Name = "S.Md. Badiul Akbar",          Designation = "SO",   Unit = "Audit",      Wing = "Special Investigation" },
                new() { EmployeeId = "8079",  Name = "Jakir Hossain",               Designation = "SO",   Unit = "Audit",      Wing = "Special Investigation" },
                new() { EmployeeId = "6402",  Name = "Md. Rafiqur Rahman",          Designation = "SO",   Unit = "Audit",      Wing = "Special Investigation" },
                new() { EmployeeId = "8027",  Name = "Wahidul Islam",               Designation = "JO",   Unit = "Audit",      Wing = "Special Investigation" },

                // IT Audit Wing - Compliance
                new() { EmployeeId = "2959",  Name = "Md. Wasim Uddin Qureshi",     Designation = "FAVP", Unit = "Audit", Wing = "IT Audit" },
                new() { EmployeeId = "6316",  Name = "Muhammad Sadequr Rahman",     Designation = "SEO",  Unit = "Audit", Wing = "IT Audit" },
                new() { EmployeeId = "6324",  Name = "Mohammad Masuf Bin Nuruddin", Designation = "SEO",  Unit = "Audit", Wing = "IT Audit" },
                new() { EmployeeId = "9317",  Name = "Rathindra Nath Mondal",       Designation = "EO",   Unit = "Audit", Wing = "IT Audit" },
                new() { EmployeeId = "9660",  Name = "Ujjwal Kanthi Dhar",          Designation = "EO",   Unit = "Audit", Wing = "IT Audit" },
                new() { EmployeeId = "9661",  Name = "Rownak Tabassum Prima",       Designation = "EO",   Unit = "Audit", Wing = "IT Audit" },
                new() { EmployeeId = "8200",  Name = "Sakif Samih-Ul-Haq",          Designation = "SO",   Unit = "Audit", Wing = "IT Audit" },
                new() { EmployeeId = "9352",  Name = "S.M. Jafrul Hasan",           Designation = "OFF",  Unit = "Audit", Wing = "IT Audit" },
                new() { EmployeeId = "7957",  Name = "Md. Salman Al-Mamun",         Designation = "OFF",  Unit = "Audit", Wing = "IT Audit" },
                new() { EmployeeId = "10228", Name = "Samzid Khan",                 Designation = "JO",   Unit = "Audit", Wing = "IT Audit" },

                // Compliance Wing - Compliance
                new() { EmployeeId = "612",   Name = "Md. Abdur Rahim",             Designation = "VP",   Unit = "Compliance", Wing = "Compliance" },
                new() { EmployeeId = "3477",  Name = "Md. Firoz Khan",              Designation = "AVP",  Unit = "Compliance", Wing = "Compliance" },
                new() { EmployeeId = "679",   Name = "Md. Helal Uddin",             Designation = "VP",   Unit = "Compliance", Wing = "Compliance" },
                new() { EmployeeId = "6835",  Name = "Md. Mahedi Hassan",           Designation = "VP",   Unit = "Compliance", Wing = "Compliance" },
                new() { EmployeeId = "9317",  Name = "Mohammad Mazharul Islam",     Designation = "FAVP", Unit = "Compliance", Wing = "Compliance" },
                new() { EmployeeId = "2767",  Name = "Muhammad Rashedul Islam",     Designation = "EO",   Unit = "Compliance", Wing = "Compliance" },
                new() { EmployeeId = "6948",  Name = "Sabrina Rashid",              Designation = "VP",   Unit = "Compliance", Wing = "Compliance" },
                new() { EmployeeId = "7993",  Name = "Sumaira Tasmeen",             Designation = "FAVP", Unit = "Compliance", Wing = "Compliance" },
                new() { EmployeeId = "790",   Name = "Md. Zahangir Alam",           Designation = "EO",   Unit = "Compliance", Wing = "Compliance" },
                
                // Other Employees
                new() { EmployeeId = "6527",  Name = "Imrul Hassan",                Designation = "FVP",  Unit = "Audit",      Wing = "Audit" },
                new() { EmployeeId = "4418",  Name = "Mohammad Ashraful Alam",      Designation = "FVP",  Unit = "Audit",      Wing = "Audit" },
                new() { EmployeeId = "4587",  Name = "Md. Saifullah",               Designation = "FVP",  Unit = "Audit",      Wing = "Audit" },
              
            
            };

            context.ICCDEmployees.AddRange(employees);
            await context.SaveChangesAsync();
        }
    }

    private static async Task EnsureSchemaAsync(AppDbContext context)
    {
        var canConnect = await context.Database.CanConnectAsync();
        if (canConnect)
        {
            // Check if this DB was bootstrapped without migrations (no history table)
            var historyExists = await HasMigrationHistoryTableAsync(context);
            if (!historyExists)
            {
                // Create history table and mark all prior migrations as applied so
                // MigrateAsync only runs the new AddFindingNewFields migration.
                await context.Database.ExecuteSqlRawAsync(@"
                    CREATE TABLE IF NOT EXISTS ""__EFMigrationsHistory"" (
                        ""MigrationId"" TEXT NOT NULL CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY,
                        ""ProductVersion"" TEXT NOT NULL
                    )");
                string[] prior =
                [
                    "20260422092636_InitialCreate",
                    "20260426104742_AddICCDEmployees",
                    "20260427120000_RebuildICCDEmployee_GuidPK",
                    "20260501125624_AddComplianceAuditReport",
                ];
                foreach (var m in prior)
                    await context.Database.ExecuteSqlRawAsync(
                        $"INSERT OR IGNORE INTO \"__EFMigrationsHistory\" VALUES ('{m}', '8.0.0')");
            }
        }
        await context.Database.MigrateAsync();
    }

    private static async Task<bool> HasMigrationHistoryTableAsync(AppDbContext context)
    {
        try
        {
            await context.Database.ExecuteSqlRawAsync(
                "SELECT 1 FROM \"__EFMigrationsHistory\" LIMIT 1");
            return true;
        }
        catch
        {
            return false;
        }
    }
}
