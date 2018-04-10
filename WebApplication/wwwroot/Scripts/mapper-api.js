var api = function () {
    this.url = "http://localhost:5001";
};

api.createCourse = function (courseName, callback) {
    $.post("http://" + this.url + "/GolfCourse/CreateCourse", {CourseName: courseName},
        function (returnedData) {
            callback(returnedData);
        }
    );
};
        
        
       